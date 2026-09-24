/**
 * Blank Layout
 *
 * Minimal shell with no chrome. Used for full-screen views such as
 * the verification page, wallet connect flow, or replay player.
 *
 * @module client/src/layouts/BlankLayout
 */

import { Outlet } from 'react-router-dom';

export default function BlankLayout() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Outlet />
    </div>
  );
}