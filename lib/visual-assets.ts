export const CAREER_ROLE_ASSETS = {
  anchor: {
    female: "/assets/global/roles/anchor-f-v001.png",
    male: "/assets/global/roles/anchor-m-v001.png",
  },
  farm: {
    female: "/assets/global/roles/farm-f-v001.png",
    male: "/assets/global/roles/farm-m-v001.png",
  },
  brand: {
    female: "/assets/global/roles/brand-f-v001.png",
    male: "/assets/global/roles/brand-m-v001.png",
  },
  ops: {
    female: "/assets/global/roles/ops-f-v001.png",
    male: "/assets/global/roles/ops-m-v001.png",
  },
  founder: {
    female: "/assets/global/roles/founder-f-v001.png",
    male: "/assets/global/roles/founder-m-v001.png",
  },
} as const;

export type CareerRoleId = keyof typeof CAREER_ROLE_ASSETS;
export type CareerAvatarGender = keyof (typeof CAREER_ROLE_ASSETS)[CareerRoleId];

export function getCareerRoleAsset(roleId: string, gender: CareerAvatarGender) {
  return CAREER_ROLE_ASSETS[roleId as CareerRoleId]?.[gender] ?? CAREER_ROLE_ASSETS.anchor[gender];
}

export const DISEASE_SAMPLE_ASSETS = {
  "leaf-spot": "/assets/global/crops/disease-tomato-early-blight-v001.webp",
  powdery: "/assets/global/crops/disease-cucumber-powdery-mildew-v001.webp",
  rust: "/assets/global/crops/disease-wheat-leaf-rust-v001.webp",
} as const;
