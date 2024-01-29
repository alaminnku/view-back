'use client';

import { CSSProperties, ReactNode, Dispatch, SetStateAction } from 'react';
import styles from './Modal.module.css';

type Props = {
  width?: CSSProperties;
  component: ReactNode;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

export default function Modal({
  width,
  component,
  showModal,
  setShowModal,
}: Props) {
  return (
    <>
      <div
        className={`${styles.modal} ${showModal && styles.show}`}
        style={{ '--width': width || 'fit-content' } as CSSProperties}
      >
        {component}
      </div>

      <div
        onClick={() => setShowModal(false)}
        className={`${styles.overlay} ${showModal && styles.show}`}
      ></div>
    </>
  );
}
