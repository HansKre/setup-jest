import { waitFor } from "@testing-library/react";
import { rest } from "msw";
import { SetupServer } from "msw/node";

import { CONTRACT_SOURCE } from "utils/hooks/useContract.types";

import { messages } from "messages";

import { mockAddToast, renderIt } from "../utils";

export async function showsErrorWhenFooTypesReqFails(server: SetupServer) {
  server.use(
    rest.get(
      `/ui/contract/:contractId/foo/document/types`,
      (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({}));
      }
    )
  );

  renderIt({
    source: CONTRACT_SOURCE.FOO,
  });

  // Error Toast
  await waitFor(() => {
    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith({
      children: messages.contract.docUpload.mbldDocTypeError,
      mode: "error",
    });
  });
}
