/**
 * Support API
 *
 * @module client/src/api/support.api
 */

import { get, post } from './client.js';
import { endpoints } from './endpoints.js';

export const supportApi = {
  listTickets: (params) => get(endpoints.support.tickets, { params }),

  createTicket: (payload) => post(endpoints.support.createTicket, payload),

  getTicket: (ticketId) => get(endpoints.support.ticket(ticketId)),

  addMessage: (ticketId, payload) => post(endpoints.support.addMessage(ticketId), payload),

  closeTicket: (ticketId) => post(endpoints.support.closeTicket(ticketId)),

  listMyTickets: (params) => get(endpoints.support.myTickets, { params }),

  getStats: () => get(endpoints.support.stats),

  listArticles: (params) => get(endpoints.support.knowledgeBase, { params }),

  getArticle: (slug) => get(endpoints.support.article(slug)),

  searchArticles: (params) => get(endpoints.support.searchArticles, { params }),

  listArticleCategories: () => get(endpoints.support.articleCategories),
};

export default supportApi;