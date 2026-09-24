/**
 * Support Routes
 *
 * Support console routes. Requires SUPPORT, ADMIN, or SUPER_ADMIN.
 *
 * @module client/src/routes/SupportRoutes
 */

import { Route } from 'react-router-dom';

import SupportLayout from '../layouts/SupportLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';

import HelpCenter from '../features/support/HelpCenter.jsx';
import SupportDashboard from '../features/support/SupportDashboard.jsx';
import CreateTicket from '../features/support/CreateTicket.jsx';
import TicketDetails from '../features/support/TicketDetails.jsx';
import MyTickets from '../features/support/MyTickets.jsx';
import KnowledgeBase from '../features/support/KnowledgeBase.jsx';

export default function SupportRoutes() {
  return (
    <Route element={<ProtectedRoute />}>
      <Route element={<RoleRoute allowed={['SUPPORT', 'ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<SupportLayout />}>
          <Route path="/support/console" element={<SupportDashboard />} />
          <Route path="/support/console/tickets" element={<MyTickets />} />
          <Route path="/support/console/tickets/create" element={<CreateTicket />} />
          <Route path="/support/console/tickets/:ticketId" element={<TicketDetails />} />
          <Route path="/support/console/knowledge-base" element={<KnowledgeBase />} />
        </Route>
      </Route>
    </Route>
  );
}