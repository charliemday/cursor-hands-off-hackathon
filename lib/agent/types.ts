import type { InferAgentUIMessage } from "ai";
import { merchAgent } from "@/lib/agent/merch-agent";

export type MerchAgentUIMessage = InferAgentUIMessage<typeof merchAgent>;
