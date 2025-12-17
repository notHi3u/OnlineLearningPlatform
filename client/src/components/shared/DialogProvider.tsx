import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

type DialogVariant = "info" | "success" | "error" | "warning";

interface DialogState {
  open: boolean;
  title?: string;
  message?: string;
  variant?: DialogVariant;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface DialogOptions {
  title?: string;
  message: string;
  variant?: DialogVariant;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface DialogContextValue {
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used within DialogProvider");
  }
  return ctx;
};

export const DialogProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = useState<DialogState>({
    open: false,
    variant: "info",
  });

  const showDialog = useCallback((options: DialogOptions) => {
    setState({
      open: true,
      title: options.title,
      message: options.message,
      variant: options.variant ?? "info",
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
    });
  }, []);

  const hideDialog = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const handleConfirm = () => {
    if (state.onConfirm) {
      state.onConfirm();
    }
    hideDialog();
  };

  const handleCancel = () => {
    if (state.onCancel) {
      state.onCancel();
    }
    hideDialog();
  };

  // style theo variant nhẹ nhàng
  const variantColor =
    state.variant === "error"
      ? "border-red-500"
      : state.variant === "success"
      ? "border-green-500"
      : state.variant === "warning"
      ? "border-yellow-500"
      : "border-indigo-500";

  const isConfirmMode = !!state.onConfirm;

  return (
    <DialogContext.Provider value={{ showDialog, hideDialog }}>
      {children}

      {state.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className={`w-full max-w-md rounded-lg bg-white p-4 shadow-lg border-l-4 ${variantColor}`}
          >
            {state.title && (
              <h2 className="mb-2 text-lg font-semibold">{state.title}</h2>
            )}

            <p className="mb-4 text-sm text-gray-700 whitespace-pre-line">
              {state.message}
            </p>

            <div className="flex justify-end gap-2">
              {isConfirmMode ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                  >
                    {state.cancelLabel ?? "Cancel"}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
                  >
                    {state.confirmLabel ?? "Confirm"}
                  </button>
                </>
              ) : (
                <button
                  onClick={hideDialog}
                  className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};
