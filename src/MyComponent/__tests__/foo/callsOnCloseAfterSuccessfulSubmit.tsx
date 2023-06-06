import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONTRACT_SOURCE } from "utils/hooks/useContract.types";

import { messages } from "messages";

import { file, mockDragData, renderIt } from "../utils";

export async function callsOnCloseAfterSuccessfulSubmit() {
  const user = userEvent.setup();

  const fileName = "dummy1.pdf";

  // manually mock fetch since whatwg-fetch does not work with multipart-POST of FormData
  jest
    .spyOn(global, "fetch")
    .mockImplementationOnce(
      jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Map(),
          clone: () => ({
            json: () =>
              Promise.resolve(["FOO", "BAR"]),
          }),
        })
      ) as jest.Mock
    )
    .mockImplementationOnce(
      jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve([
              {
                id: "new1",
                fileName,
                uploadedSuccessfully: true,
              },
            ]),
        })
      ) as jest.Mock
    );

  const mockOnClose = jest.fn().mockName("onClose");

  const contractId = 87654321;

  renderIt({
    source: CONTRACT_SOURCE.FOO,
    onClose: mockOnClose,
    contractId,
  });

  // add 1 file
  await act(() =>
    fireEvent.drop(
      screen.getByTestId("uploadArea"),
      mockDragData([file(fileName)])
    )
  );

  // assert first fetch to /foo/document/types
  expect(global.fetch).toHaveBeenCalledWith(
    `/ui/contract/${contractId}/foo/document/types`,
    expect.anything()
  );

  // assert file was added
  await waitFor(() =>
    expect(screen.getByRole("table")).toHaveTextContent(
      "NameKategoriedummy1.pdfdummy1.pdfBitte wählenFoo Bar Baz"
    )
  );

  const optionToSelect = screen.getByRole<HTMLOptionElement>("option", {
    name: "Foo",
  });

  expect(optionToSelect).toBeInTheDocument();

  // select the option
  await act(() =>
    user.selectOptions(screen.getByRole("combobox"), optionToSelect)
  );

  expect(optionToSelect.selected).toBeTruthy();

  // assert file still there and option is selected
  expect(screen.getByRole("table")).toHaveTextContent(
    "NameKategoriedummy1.pdfdummy1.pdfFoo Bar Baz"
  );

  const primaryBtn = screen.getByText(messages.contract.docUpload.submit);

  // assert primary btn is enabled
  expect(primaryBtn).toBeEnabled();

  // click primary btn
  await act(() => fireEvent.submit(primaryBtn));

  // assert second fetch to /foo/document/upload
  expect(global.fetch).toHaveBeenCalledWith(
    `/ui/contract/${contractId}/foo/document/upload`,
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      body: expect.any(Object),
      method: "POST",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      signal: expect.any(Object),
    }
  );

  // assert onClose was called
  await waitFor(() => expect(mockOnClose).toHaveBeenCalledTimes(1));
}
