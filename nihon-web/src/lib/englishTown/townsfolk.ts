// The English isle's townsfolk: the adventurers who live there (KayKit Adventurers, CC0), each with a name, a part of
// the learner's study they look after, and the model they're drawn with. Pure, so it runs under node's test runner.

export type TownsfolkId = "knight" | "mage" | "ranger" | "barbarian" | "rogue_hooded";
/** `role` says what they do in English, `roleVi` in Vietnamese; `model` is their KayKit character. */
export type Townsperson = { id: TownsfolkId; name: string; role: string; roleVi: string; model: string };

export const TOWNSFOLK: Readonly<Record<TownsfolkId, Townsperson>> = {
  knight: { id: "knight", name: "Sir Edmund", role: "the castle knight", roleVi: "hiệp sĩ của lâu đài", model: "knight" },
  mage: { id: "mage", name: "Morwen", role: "the wise woman", roleVi: "bà thông thái", model: "mage" },
  ranger: { id: "ranger", name: "Wren", role: "the minstrel ranger", roleVi: "người lữ hành hát rong", model: "ranger" },
  barbarian: { id: "barbarian", name: "Bran", role: "the market trader", roleVi: "người bán hàng ở chợ", model: "barbarian" },
  rogue_hooded: { id: "rogue_hooded", name: "Kit", role: "the messenger", roleVi: "người đưa thư", model: "rogue_hooded" },
};

/** "Sir Edmund, the castle knight": how a townsperson is introduced beside what they say. */
export const introduceTownsperson = ({ name, role }: Townsperson) => `${name}, ${role}`;
