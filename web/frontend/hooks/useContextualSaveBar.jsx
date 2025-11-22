import { useEffect, useRef } from 'react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { ContextualSaveBar as AppBridgeSaveBar } from '@shopify/app-bridge/actions';
import isEqual from 'fast-deep-equal'; // browser-friendly deep equality

export function useContextualSaveBar({
  tempData,
  savedData,
  onSave,
  onDiscard,
  message = 'You have unsaved changes',
}) {
  const app = useAppBridge();
  const saveBarRef = useRef(null);

  useEffect(() => {
    const hasChanges = !isEqual(tempData, savedData ?? {});

    if (hasChanges && !saveBarRef.current) {
      saveBarRef.current = AppBridgeSaveBar.create(app, {
        message,
        saveAction: {
          label: 'Save',
          onAction: () => {
            if (onSave) onSave();
            saveBarRef.current?.dispatch(AppBridgeSaveBar.Action.CLEAR);
            saveBarRef.current = null;
          },
        },
        discardAction: {
          label: 'Discard',
          onAction: () => {
            if (onDiscard) onDiscard();
            saveBarRef.current?.dispatch(AppBridgeSaveBar.Action.CLEAR);
            saveBarRef.current = null;
          },
        },
      });
    } else if (!hasChanges && saveBarRef.current) {
      saveBarRef.current.destroy();
      saveBarRef.current = null;
    }

    return () => {
      if (saveBarRef.current) {
        saveBarRef.current.destroy();
        saveBarRef.current = null;
      }
    };
  }, [tempData, savedData, app, onSave, onDiscard, message]);
}
