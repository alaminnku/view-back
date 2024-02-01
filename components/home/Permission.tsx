import { Dispatch, SetStateAction } from 'react';

type Props = {
  setAllowAccess: Dispatch<SetStateAction<boolean>>;
};

export default function Permission({ setAllowAccess }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p>Needs access to camera and microphone? Do you want to allow?</p>
      <div>
        <button style={buttonStyle} onClick={() => setAllowAccess(true)}>
          Yes
        </button>
        <button style={buttonStyle} onClick={() => setAllowAccess(false)}>
          No
        </button>
      </div>
    </div>
  );
}

const buttonStyle = {
  border: 'none',
  padding: '8px 16px',
  color: 'white',
  backgroundColor: 'black',
  marginTop: '16px',
  marginRight: '16px',
};
