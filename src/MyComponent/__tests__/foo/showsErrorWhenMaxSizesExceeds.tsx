import { act, fireEvent, screen } from "@testing-library/react";

import { MAX_FILE_SIZE_FOO } from "utils/api/utils/constants";
import { CONTRACT_SOURCE } from "utils/hooks/useContract.types";

import { mockAddToast, mockDragData, renderIt } from "../utils";

export async function showsErrorWhenMaxSizesExceeds() {
  const file = {
    name: "dummy.pdf",
    type: "application/pdf",
    size: MAX_FILE_SIZE_FOO + 1,
  } as File;

  renderIt({
    source: CONTRACT_SOURCE.BAR,
  });

  await act(() =>
    fireEvent.drop(screen.getByTestId("uploadArea"), mockDragData([file]))
  );

  // assert file was not added
  expect(screen.getByRole("table")).toHaveTextContent("NameKategorie");

  // Error shown
  expect(mockAddToast).toHaveBeenCalledWith({
    children:
      "Datei 'dummy.pdf' kann nicht berücksichtigt werden, da sie die maximal zulässige Größe von 16MB überschreitet.",
    mode: "error",
  });
}
