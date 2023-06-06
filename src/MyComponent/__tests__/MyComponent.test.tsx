/* eslint-disable jest/expect-expect */
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import {
  rendersEmptyDialogFOO,
  rendersEmptyDialogWithReqList,
  addsNewestFileToTop,
  deletesFileOnBtnClick,
  showsErrorWhenIllegalFileTypeDropped,
  showsErrorWhenMaxSizesExceedsFOO,
  showsConfirmationDialogOnClose,
  clearsSelectedFilesWhenConfirmed,
  callsOnCloseAfterSuccessfulSubmitFOO,
  issuesTwoSeparateRequests,
} from './foo';
import {
  rendersEmptyDialogBAR,
  showsErrorWhenAlfaTypesReqFails,
  hasNoCheckboxAndCatFromRes,
  showsErrorWhenMaxSizesExceedsBAR,
  callsOnCloseAfterSuccessfulSubmitBAR,
} from './bar';
import { mockAddToast } from './utils';

jest.mock('utils/legacy-hooks', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  useFetch: jest.requireActual('utils/legacy-hooks').useFetch,
  useToasts: () => ({ addToast: mockAddToast }),
}));

describe('DocUploadDialog', () => {
  const mockRequest = jest.fn();
  const server = setupServer(
    rest.get(
      `/ui/contract/:contractId/alfa/document/types`,
      (req, res, ctx) => {
        mockRequest(req.params.contractId);
        return res(ctx.json({}));
      }
    )
  );

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });
  afterAll(() => server.close());

  describe('FOO', () => {
    it('renders empty dialog', () => rendersEmptyDialogFOO());

    it('renders empty dialog /w RequirementsList', () =>
      rendersEmptyDialogWithReqList());

    it('adds newest file to top of list when onDrop event occurs and correct columns and categories', async () =>
      await addsNewestFileToTop());

    it('deletes file on button-click', async () =>
      await deletesFileOnBtnClick());

    it('shows error when illegal file-type is dropped', async () =>
      await showsErrorWhenIllegalFileTypeDropped());

    it('shows error when dropped file exceeds max-size', async () =>
      await showsErrorWhenMaxSizesExceedsFOO());

    it('shows confirmation dialog when user tries to close dialog', async () =>
      await showsConfirmationDialogOnClose());

    it('clears selected files when confirmation dialog is confirmed', async () =>
      await clearsSelectedFilesWhenConfirmed());

    it('calls onClose-fn after successful submit', async () =>
      await callsOnCloseAfterSuccessfulSubmitFOO());

    it('issues two separate requests when docs are selected for direct and cached upload', async () =>
      await issuesTwoSeparateRequests());
  });

  describe('BAR', () => {
    it('renders empty dialog', async () =>
      await rendersEmptyDialogBAR(mockRequest));

    it('shows error when /alfa/document/types request fails', async () =>
      await showsErrorWhenAlfaTypesReqFails(server));

    it('has no direct-upload-checkbox and has categories from response', async () =>
      await hasNoCheckboxAndCatFromRes(server));

    it('shows error when dropped file exceeds max-size', async () =>
      await showsErrorWhenMaxSizesExceedsBAR());

    it('calls onClose-fn after successful submit', async () =>
      await callsOnCloseAfterSuccessfulSubmitBAR());
  });
});
