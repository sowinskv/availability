import { useState, useCallback } from 'react';
import React from 'react';
import { Modal } from '../components/Modal';

interface ModalState {
  isOpen: boolean;
  title?: string;
  message: string;
  type: 'alert' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const useModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    message: '',
    type: 'alert',
  });

  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const showAlert = useCallback((message: string, title?: string) => {
    setModalState({
      isOpen: true,
      message,
      title,
      type: 'alert',
    });
  }, []);

  const showConfirm = useCallback((message: string, title?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        message,
        title,
        type: 'confirm',
        onConfirm: () => {
          resolve(true);
          setResolvePromise(null);
        },
        onCancel: () => {
          resolve(false);
          setResolvePromise(null);
        },
      });
      setResolvePromise(() => resolve);
    });
  }, []);

  const ModalComponent = React.createElement(Modal, {
    ...modalState,
    onClose: closeModal,
  });

  return {
    showAlert,
    showConfirm,
    ModalComponent,
  };
};
