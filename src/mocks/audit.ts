import type { HttpResponseResolver, PathParams } from "msw";
import { HttpResponse } from "msw";
import type { AuditLog, User } from "@/lib/types";
import { getUserFromRequest } from "./auth";
import { addAuditLog } from "./db";

export const MSW_RESPONSE_DELAY_MS = 600;

type AuditContext = {
  params: PathParams;
  request: Request;
  response: Response;
};

type WithAuditOptions = {
  action: AuditLog["action"];
  entityType: AuditLog["entityType"];
  getEntityId: (ctx: AuditContext) => string | Promise<string>;
  getOldValue?: (
    ctx: Omit<AuditContext, "response">,
  ) => string | undefined | Promise<string | undefined>;
  getNewValue: (ctx: AuditContext) => string | Promise<string>;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function withDelay(
  resolver: HttpResponseResolver,
  ms: number = MSW_RESPONSE_DELAY_MS,
): HttpResponseResolver {
  return async (info) => {
    await wait(ms);
    return resolver(info);
  };
}

export function withAuth(resolver: HttpResponseResolver): HttpResponseResolver {
  return withDelay(async (info) => {
    const user = getUserFromRequest(info.request);
    if (!user) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return resolver(info);
  });
}

export function withAudit(
  resolver: HttpResponseResolver,
  options: WithAuditOptions,
): HttpResponseResolver {
  return async (info) => {
    const { request, params } = info;
    let oldValue: string | undefined;
    if (options.getOldValue) {
      oldValue = await options.getOldValue({ params, request });
    }

    const response = await resolver(info);
    if (response instanceof Response && response.status >= 200 && response.status < 300) {
      const user: User | null = getUserFromRequest(request);
      const entityId = await options.getEntityId({ params, request, response });
      const newValue = await options.getNewValue({ params, request, response });
      addAuditLog({
        action: options.action,
        entityType: options.entityType,
        entityId,
        oldValue,
        newValue,
        userId: user?.id ?? "unknown",
        username: user?.username ?? "unknown",
      });
    }

    return response;
  };
}
