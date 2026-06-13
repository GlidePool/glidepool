import type { HTMLAttributes } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-button': HTMLAttributes<HTMLElement> & {
        size?: 'md' | 'sm';
        label?: string;
        loadingLabel?: string;
        disabled?: boolean;
        balance?: 'show' | 'hide';
      };
      'w3m-account-button': HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        balance?: 'show' | 'hide';
      };
      'w3m-connect-button': HTMLAttributes<HTMLElement> & {
        size?: 'md' | 'sm';
        label?: string;
        loadingLabel?: string;
      };
      'w3m-network-button': HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
      };
    }
  }
}

export {};
