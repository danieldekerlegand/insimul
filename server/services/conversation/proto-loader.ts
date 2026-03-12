/**
 * Loads the conversation.proto definition for use with @grpc/grpc-js.
 *
 * Usage:
 *   const proto = await loadConversationProto();
 *   const service = proto.insimul.conversation.InsimulConversation.service;
 */

import path from "path";
import { fileURLToPath } from "url";
import * as protoLoader from "@grpc/proto-loader";
import * as grpc from "@grpc/grpc-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(__dirname, "../../../proto/conversation.proto");

const LOADER_OPTIONS: protoLoader.Options = {
  keepCase: false, // convert to camelCase
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

let cachedDefinition: grpc.GrpcObject | null = null;

/**
 * Load and cache the conversation proto package definition.
 * Returns the fully-resolved gRPC object with service descriptors.
 */
export async function loadConversationProto(): Promise<grpc.GrpcObject> {
  if (cachedDefinition) return cachedDefinition;

  const packageDefinition = await protoLoader.load(PROTO_PATH, LOADER_OPTIONS);
  cachedDefinition = grpc.loadPackageDefinition(packageDefinition);
  return cachedDefinition;
}

/**
 * Convenience: get the InsimulConversation service definition.
 */
export async function getConversationServiceDefinition() {
  const proto = await loadConversationProto();
  const insimul = proto.insimul as grpc.GrpcObject;
  const conversation = insimul.conversation as grpc.GrpcObject;
  return conversation.InsimulConversation as grpc.ServiceClientConstructor;
}
