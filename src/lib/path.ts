import { LEVELS, type Level } from "./levels";
import type { Progress } from "./progress";
import { SCENARIOS, UNITS, type Scenario, type Unit } from "./scenarios";

// A trilha: cada tema tem uma lição de exercícios e depois uma conversa.

export type NodeKind = "exercises" | "conversation";

export type PathNode = {
  id: string; // "cafeteria:licao" ou "cafeteria:conversa"
  kind: NodeKind;
  scenario: Scenario;
  unit: Unit;
};

export type NodeStatus = "done" | "current" | "unlocked" | "locked";

export const PATH: PathNode[] = UNITS.flatMap((unit) =>
  SCENARIOS.filter((s) => s.level === unit.level).flatMap((scenario) => [
    { id: `${scenario.id}:licao`, kind: "exercises" as const, scenario, unit },
    { id: `${scenario.id}:conversa`, kind: "conversation" as const, scenario, unit },
  ]),
);

export function nodeHref(node: PathNode) {
  return node.kind === "exercises" ? `/licao/${node.scenario.id}` : `/conversa/${node.scenario.id}`;
}

export function findNode(id: string) {
  return PATH.find((n) => n.id === id);
}

// Unidades abaixo do nível do aluno ficam liberadas para revisão. A partir do
// nível dele, cada etapa libera a seguinte, como uma trilha.
export function nodeStatuses(progress: Progress): Map<string, NodeStatus> {
  const levelIndex = LEVELS.indexOf((progress.level ?? "A1") as Level);
  const statuses = new Map<string, NodeStatus>();
  let previousDone = true;
  let currentAssigned = false;

  for (const node of PATH) {
    const done = Boolean(progress.completed[node.id]);
    const belowLevel = LEVELS.indexOf(node.unit.level) < levelIndex;
    let status: NodeStatus;
    if (done) status = "done";
    else if (belowLevel) status = "unlocked";
    else if (previousDone && !currentAssigned) {
      status = "current";
      currentAssigned = true;
    } else status = "locked";

    statuses.set(node.id, status);
    if (!belowLevel) previousDone = done;
  }
  return statuses;
}

export function currentNode(progress: Progress) {
  const statuses = nodeStatuses(progress);
  return PATH.find((n) => statuses.get(n.id) === "current") ?? null;
}
