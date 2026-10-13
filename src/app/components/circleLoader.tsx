import React from 'react';
import { TailSpin } from 'react-loader-spinner';

const CircleLoader = () => {
  return (
    <div className="my-[50px] flex items-center justify-center re
    lative w-full h-[100px]">
      <TailSpin
        visible={true}
        height="50"
        width="50"
        color="#18344e"
        radius="1"
        ariaLabel="tail-spin-loading"
        wrapperClass=""
        wrapperStyle={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)', // Center the loader
        }}
      />
    </div>
  );
};
export default CircleLoader;
