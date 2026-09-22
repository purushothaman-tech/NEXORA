export interface AnatomicalRegion {
  id: string;
  legacyId: string; // To map back to mednova BodyRegion
  label: string;
  isPaired: boolean;
  subRegions?: AnatomicalSubRegion[];
}

export interface AnatomicalSubRegion {
  id: string;
  label: string;
  isPaired?: boolean; // If the parent isn't paired but the subregion is (e.g. Eye in Head)
  specificRegions?: { id: string; label: string }[];
}

export const BODY_HIERARCHY: AnatomicalRegion[] = [
  {
    id: 'head',
    legacyId: 'head_neck',
    label: 'Head & Neck',
    isPaired: false,
    subRegions: [
      { id: 'scalp', label: 'Scalp' },
      { id: 'face', label: 'Face' },
      { id: 'forehead', label: 'Forehead' },
      { id: 'eye', label: 'Eye', isPaired: true },
      { id: 'ear', label: 'Ear', isPaired: true },
      { id: 'nose', label: 'Nose' },
      { id: 'mouth', label: 'Mouth' },
      { id: 'jaw', label: 'Jaw' },
      { id: 'neck', label: 'Neck' },
    ]
  },
  {
    id: 'upper_limb',
    legacyId: 'upper_limbs',
    label: 'Arm',
    isPaired: true,
    subRegions: [
      { id: 'shoulder', label: 'Shoulder' },
      { id: 'upper_arm', label: 'Upper Arm' },
      { id: 'elbow', label: 'Elbow' },
      { id: 'forearm', label: 'Forearm' },
      { id: 'wrist', label: 'Wrist' },
      { 
        id: 'hand', 
        label: 'Hand',
        specificRegions: [
          { id: 'palm', label: 'Palm' },
          { id: 'back_of_hand', label: 'Back of Hand' },
          { id: 'thumb', label: 'Thumb' },
          { id: 'index_finger', label: 'Index Finger' },
          { id: 'middle_finger', label: 'Middle Finger' },
          { id: 'ring_finger', label: 'Ring Finger' },
          { id: 'little_finger', label: 'Little Finger' }
        ]
      },
    ]
  },
  {
    id: 'torso_front',
    legacyId: 'chest',
    label: 'Chest',
    isPaired: false,
    subRegions: [
      { id: 'left_chest', label: 'Left Chest' },
      { id: 'right_chest', label: 'Right Chest' },
      { id: 'center_chest', label: 'Center Chest' },
      { id: 'upper_chest', label: 'Upper Chest' },
      { id: 'lower_chest', label: 'Lower Chest' },
    ]
  },
  {
    id: 'abdomen',
    legacyId: 'abdomen',
    label: 'Abdomen',
    isPaired: false,
    subRegions: [
      { id: 'upper_abdomen', label: 'Upper Abdomen' },
      { id: 'lower_abdomen', label: 'Lower Abdomen' },
      { id: 'left_abdomen', label: 'Left Abdomen' },
      { id: 'right_abdomen', label: 'Right Abdomen' },
      { id: 'center_abdomen', label: 'Center Abdomen' },
    ]
  },
  {
    id: 'pelvis',
    legacyId: 'pelvis_urinary',
    label: 'Pelvis',
    isPaired: false,
    subRegions: [
      { id: 'left_pelvis', label: 'Left' },
      { id: 'right_pelvis', label: 'Right' },
      { id: 'center_pelvis', label: 'Center' },
    ]
  },
  {
    id: 'back',
    legacyId: 'spine_back',
    label: 'Back',
    isPaired: false,
    subRegions: [
      { id: 'upper_back', label: 'Upper Back' },
      { id: 'mid_back', label: 'Mid Back' },
      { id: 'lower_back', label: 'Lower Back' },
      { id: 'left_back', label: 'Left Back' },
      { id: 'right_back', label: 'Right Back' },
    ]
  },
  {
    id: 'lower_limb',
    legacyId: 'lower_limbs',
    label: 'Leg',
    isPaired: true,
    subRegions: [
      { id: 'hip', label: 'Hip' },
      { id: 'thigh', label: 'Thigh' },
      { id: 'knee', label: 'Knee' },
      { id: 'calf', label: 'Calf' },
      { id: 'shin', label: 'Shin' },
      { id: 'ankle', label: 'Ankle' },
      { 
        id: 'foot', 
        label: 'Foot',
        specificRegions: [
          { id: 'heel', label: 'Heel' },
          { id: 'sole', label: 'Sole' },
          { id: 'top_of_foot', label: 'Top of Foot' },
          { id: 'big_toe', label: 'Big Toe' },
          { id: 'second_toe', label: 'Second Toe' },
          { id: 'third_toe', label: 'Third Toe' },
          { id: 'fourth_toe', label: 'Fourth Toe' },
          { id: 'little_toe', label: 'Little Toe' },
        ]
      },
    ]
  },
  {
    id: 'skin',
    legacyId: 'skin_generalized',
    label: 'Generalized Skin / Whole Body',
    isPaired: false,
  }
];
