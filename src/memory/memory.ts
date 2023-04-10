import { isEmpty } from "lodash";
import { Event, messageEvent } from ".";
import { primerMessage } from "../message";
import { Store } from "../store";
import { agentName, messageSourceName } from "../util";

export class Memory {
  constructor(private agentId: string, private store: Store) {}

  async append(event: Event): Promise<Event[]> {
    printEvent(event);
    const events = await this.retrieve();
    events.push(event);
    await this.store.set(keyFor(this.agentId), JSON.stringify(events, null, 2));
    return events;
  }

  async retrieve(): Promise<Event[]> {
    const eventsText = await this.store.get(keyFor(this.agentId));
    const events: Event[] = JSON.parse(eventsText || "[]");
    if (isEmpty(events)) events.push(messageEvent(primerMessage(this.agentId)));
    return events;
  }
}

function keyFor(agentId: string) {
  return `agent-${agentId}`;
}

function printEvent(event: Event) {
  let sourceName: string;
  let targetNames: string[];
  let content: string;
  if (event.type === "message") {
    const { message } = event;
    sourceName = messageSourceName(message.source);
    targetNames = message.targetAgentIds?.map(agentName);
    content = message.content;
  } else {
    sourceName = agentName(event.agentId);
    targetNames = ["System"];
    content = event.decision.actionText;
  }
  console.log(
    `${sourceName} -> ${targetNames.join(
      ", "
    )}:\n\n${content}\n\n=============\n`
  );
}