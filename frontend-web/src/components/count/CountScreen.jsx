import React, { useState } from 'react';
import { useCount } from '../../hooks/useCount'

export const CountScreen = () => {
    const [count , setCount] = useCount()

    return (
        <div>
          <p>You clicked {count} times</p>
          <button onClick={() => setCount(count + 1)}>
            Click me
          </button>
        </div>
      );
};