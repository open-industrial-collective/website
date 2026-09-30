// This is a reviewed public roster, not a GitHub organization member import.
// Add an individual only after they accept the role and separately opt in to the displayed fields.
export type PublicSteward = {
  id: string;
  name: string;
  role: string;
  scope: string;
  initials: string;
  websiteUrl?: string;
  profileUrl?: string;
};

export const publicStewards: PublicSteward[] = [
  {
    id: "grindstone-systems",
    name: "Grindstone Systems",
    role: "Founding initiator",
    scope: "Interim website and program stewardship",
    initials: "GS",
    websiteUrl: "https://www.grindstonesystems.com/",
  },
];
