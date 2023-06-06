import { act, fireEvent, screen } from "@testing-library/react";
import { rest } from "msw";
import { SetupServer } from "msw/node";

import { CONTRACT_SOURCE } from "utils/hooks/useContract.types";

import { file, mockDragData, renderIt } from "../utils";

export async function hasNoCheckboxAndCatFromRes(server: SetupServer) {
  server.use(
    rest.get(
      `/ui/contract/:contractId/foo/document/types`,
      (req, res, ctx) => {
        return res(ctx.json(["FOO", "BAR"]));
      }
    )
  );

  renderIt({
    source: CONTRACT_SOURCE.MBLD,
  });

  // add file
  await act(() =>
    fireEvent.drop(
      screen.getByTestId("uploadArea"),
      mockDragData([file("dummy1.pdf")])
    )
  );

  // assert table-columns, file-name, checkbox, categories
  expect(screen.getByRole("table")).toHaveTextContent(
    "NameKategoriedummy1.pdfdummy1.pdfBitte wählenFoo Bar Baz"
  );
}
