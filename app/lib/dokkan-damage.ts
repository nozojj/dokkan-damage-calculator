export type TypeMatchup = "advantage" | "favorable" | "neutral" | "disadvantage";

export const TYPE_MATCHUP_COEFFICIENT: Record<TypeMatchup, number> = {
  advantage: 1.5, // 属性 抜群
  favorable: 1.25, // 属性 得意
  neutral: 1, // 五分
  disadvantage: 0.5, // 属性 不利
};

export const CRITICAL_COEFFICIENT = 1.875;

export interface DamageInput {
  baseAtk: number;
  leaderSkillMultiplier: number;
  passiveMultiplier: number;
  otherAtkMultiplier: number;
  kiMultiplier: number;
  superAttackMultiplier: number;
  enemyDef: number;
  enemyDamageReductionPercent: number;
  typeMatchup: TypeMatchup;
  isCritical: boolean;
}

export interface DamageResult {
  finalAtk: number;
  effectiveDef: number;
  atkMinusDef: number;
  coefficient: number;
  damage: number;
}

export function calculateDamage(input: DamageInput): DamageResult {
  const finalAtk =
    input.baseAtk *
    input.leaderSkillMultiplier *
    input.passiveMultiplier *
    input.otherAtkMultiplier *
    input.kiMultiplier *
    input.superAttackMultiplier;

  const effectiveDef = input.isCritical ? 0 : input.enemyDef;
  const atkMinusDef = Math.max(finalAtk - effectiveDef, 1);

  const coefficient = input.isCritical
    ? CRITICAL_COEFFICIENT
    : TYPE_MATCHUP_COEFFICIENT[input.typeMatchup];

  const reduction = 1 - input.enemyDamageReductionPercent / 100;

  const damage = Math.floor(atkMinusDef * reduction * coefficient);

  return { finalAtk, effectiveDef, atkMinusDef, coefficient, damage };
}
