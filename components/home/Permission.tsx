import { Dispatch, SetStateAction } from 'react';

type Props = {
  setAllowAccess: Dispatch<SetStateAction<boolean>>;
};

export default function Permission({ setAllowAccess }: Props) {
  return (
    <div>
      <p>Needs access to camera and microphone? Do you want to allow?</p>
      <div>
        <button onClick={() => setAllowAccess(true)}>Yes</button>
        <button onClick={() => setAllowAccess(false)}>No</button>
      </div>
    </div>
  );
}
