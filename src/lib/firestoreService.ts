import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { QueueTicket, AuditLogEntry } from '../types/mednova';

const TICKETS_COLLECTION = 'queue_tickets';
const AUDIT_COLLECTION = 'audit_logs';

/**
 * Real-time subscription to clinical queue tickets in Firestore.
 * Ensures stable unsubscription, graceful reconnection, and zero state loss on temporary disconnect.
 */
export function subscribeToQueueTickets(
  onTicketsChanged: (tickets: QueueTicket[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const q = collection(db, TICKETS_COLLECTION);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tickets: QueueTicket[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.id) {
            tickets.push(data as QueueTicket);
          }
        });
        
        // Sort descending by priorityRank or creation date
        tickets.sort((a, b) => {
          if (b.priorityRank !== a.priorityRank) {
            return (b.priorityRank || 0) - (a.priorityRank || 0);
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        onTicketsChanged(tickets);
      },
      (error) => {
        // Network/proxy reconnection issues are expected in sandboxed environments
        // Firebase automatically handles retry internally; notify listener without throwing
        console.warn('Firestore tickets realtime connection note:', error?.message);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Unable to initialize tickets realtime subscription:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Real-time subscription to ABDM clinical compliance audit logs.
 * Returns safe unsubscribe function and handles reconnects gracefully.
 */
export function subscribeToAuditLogs(
  onLogsChanged: (logs: AuditLogEntry[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const q = collection(db, AUDIT_COLLECTION);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs: AuditLogEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.id) {
            logs.push(data as AuditLogEntry);
          }
        });
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        onLogsChanged(logs);
      },
      (error) => {
        console.warn('Firestore audit logs realtime connection note:', error?.message);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Unable to initialize audit logs realtime subscription:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Persists a new or updated QueueTicket to Firestore
 */
export async function saveQueueTicket(ticket: QueueTicket): Promise<void> {
  try {
    const docRef = doc(db, TICKETS_COLLECTION, ticket.id);
    await setDoc(docRef, ticket, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${TICKETS_COLLECTION}/${ticket.id}`);
  }
}

/**
 * Updates an existing QueueTicket in Firestore
 */
export async function updateQueueTicketInFirestore(
  ticketId: string,
  updates: Partial<QueueTicket>
): Promise<void> {
  try {
    const docRef = doc(db, TICKETS_COLLECTION, ticketId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${TICKETS_COLLECTION}/${ticketId}`);
  }
}

/**
 * Records an ABDM audit log in Firestore
 */
export async function saveAuditLogInFirestore(entry: AuditLogEntry): Promise<void> {
  try {
    const docRef = doc(db, AUDIT_COLLECTION, entry.id);
    await setDoc(docRef, entry);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${AUDIT_COLLECTION}/${entry.id}`);
  }
}

/**
 * Seeds initial Firestore collection on boot if the database is newly provisioned
 */
export async function seedInitialFirestoreDataIfNeeded(
  initialTickets: QueueTicket[],
  initialLogs: AuditLogEntry[]
): Promise<void> {
  try {
    const ticketsSnap = await getDocs(query(collection(db, TICKETS_COLLECTION), limit(1)));
    if (ticketsSnap.empty) {
      console.info('Seeding initial MedNova clinical tickets into Firestore...');
      for (const ticket of initialTickets) {
        const docRef = doc(db, TICKETS_COLLECTION, ticket.id);
        await setDoc(docRef, ticket);
      }
    }

    const logsSnap = await getDocs(query(collection(db, AUDIT_COLLECTION), limit(1)));
    if (logsSnap.empty) {
      console.info('Seeding initial MedNova audit logs into Firestore...');
      for (const log of initialLogs) {
        const docRef = doc(db, AUDIT_COLLECTION, log.id);
        await setDoc(docRef, log);
      }
    }
  } catch (error) {
    console.warn('Initial Firestore data seeding skipped or offline:', error);
  }
}
