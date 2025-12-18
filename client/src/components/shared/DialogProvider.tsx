import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

/* ================= TYPES ================= */

type DialogVariant = "info" | "success" | "error" | "warning";

interface DialogInput {
  name: string;                // 👈 key trả về
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  type?: "text" | "password";
  autoComplete?: string;
}

interface DialogState {
  open: boolean;
  title?: string;
  message?: string;
  variant?: DialogVariant;
  inputs?: DialogInput[];
  values?: Record<string, string>;
  onConfirm?: (values?: Record<string, string>) => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface DialogOptions {
  title?: string;
  message: string;
  variant?: DialogVariant;
  inputs?: DialogInput[]; // 👈 MULTI INPUT
  onConfirm?: (values?: Record<string, string>) => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface DialogContextValue {
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
}

/* ================= CONTEXT ================= */

const DialogContext = createContext<DialogContextValue | undefined>(
  undefined
);

export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used within DialogProvider");
  }
  return ctx;
};

/* ================= PROVIDER ================= */

export const DialogProvider: React.FC<
  React.PropsWithChildren
> = ({ children }) => {
  const [state, setState] = useState<DialogState>({
    open: false,
    variant: "info",
  });

  const showDialog = useCallback((options: DialogOptions) => {
    const initialValues: Record<string, string> = {};
    options.inputs?.forEach((i) => {
      initialValues[i.name] = i.defaultValue || "";
    });

    setState({
      open: true,
      title: options.title,
      message: options.message,
      variant: options.variant ?? "info",
      inputs: options.inputs,
      values: initialValues,
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
    if (state.inputs) {
      for (const input of state.inputs) {
        if (
          input.required &&
          !state.values?.[input.name]?.trim()
        ) {
          return;
        }
      }
    }

    state.onConfirm?.(state.values);
    hideDialog();
  };

  const handleCancel = () => {
    state.onCancel?.();
    hideDialog();
  };

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
              <h2 className="mb-2 text-lg font-semibold">
                {state.title}
              </h2>
            )}

            <p className="mb-3 text-sm text-gray-700 whitespace-pre-line">
              {state.message}
            </p>

            {/* 🔥 MULTI INPUTS */}
            {state.inputs?.map((input) => (
              <input
                key={input.name}
                type={input.type ?? "text"}
                autoComplete={input.autoComplete}
                placeholder={input.placeholder}
                value={state.values?.[input.name] || ""}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    values: {
                      ...prev.values,
                      [input.name]: e.target.value,
                    },
                  }))
                }
                className="mb-3 w-full rounded-md border px-3 py-2 text-sm
                           focus:ring-2 focus:ring-indigo-500"
              />
            ))}

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
