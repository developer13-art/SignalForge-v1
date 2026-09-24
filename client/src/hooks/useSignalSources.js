/**
 * useSignalSources Hook
 *
 * @module client/src/hooks/useSignalSources
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sourceApi } from '../api/source.api.js';
import { telegramApi } from '../api/telegram.api.js';
import { discordApi } from '../api/discord.api.js';
import { whatsappApi } from '../api/whatsapp.api.js';
import { tradingviewApi } from '../api/tradingview.api.js';
import { emailApi } from '../api/email.api.js';
import { useAuth } from './useAuth.js';

export const sourceKeys = {
  all: ['sources'],
  list: () => [...sourceKeys.all, 'list'],
  source: (sourceId) => [...sourceKeys.all, 'source', sourceId],
  telegramStatus: () => [...sourceKeys.all, 'telegram', 'status'],
  telegramChannels: () => [...sourceKeys.all, 'telegram', 'channels'],
  discordStatus: () => [...sourceKeys.all, 'discord', 'status'],
  discordGuilds: () => [...sourceKeys.all, 'discord', 'guilds'],
  whatsappStatus: () => [...sourceKeys.all, 'whatsapp', 'status'],
  whatsappGroups: () => [...sourceKeys.all, 'whatsapp', 'groups'],
  tradingviewIntegrations: () => [...sourceKeys.all, 'tradingview', 'integrations'],
  emailStatus: () => [...sourceKeys.all, 'email', 'status'],
};

export function useSignalSources() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: sourceKeys.list(),
    queryFn: () => sourceApi.list(),
    enabled: isAuthenticated,
  });

  const telegramStatusQuery = useQuery({
    queryKey: sourceKeys.telegramStatus(),
    queryFn: () => telegramApi.getStatus(),
    enabled: isAuthenticated,
  });

  const telegramChannelsQuery = useQuery({
    queryKey: sourceKeys.telegramChannels(),
    queryFn: () => telegramApi.listChannels(),
    enabled: isAuthenticated && Boolean(telegramStatusQuery.data),
  });

  const discordStatusQuery = useQuery({
    queryKey: sourceKeys.discordStatus(),
    queryFn: () => discordApi.getStatus(),
    enabled: isAuthenticated,
  });

  const discordGuildsQuery = useQuery({
    queryKey: sourceKeys.discordGuilds(),
    queryFn: () => discordApi.listGuilds(),
    enabled: isAuthenticated && Boolean(discordStatusQuery.data),
  });

  const whatsappStatusQuery = useQuery({
    queryKey: sourceKeys.whatsappStatus(),
    queryFn: () => whatsappApi.getStatus(),
    enabled: isAuthenticated,
  });

  const whatsappGroupsQuery = useQuery({
    queryKey: sourceKeys.whatsappGroups(),
    queryFn: () => whatsappApi.listGroups(),
    enabled: isAuthenticated && Boolean(whatsappStatusQuery.data),
  });

  const tradingviewIntegrationsQuery = useQuery({
    queryKey: sourceKeys.tradingviewIntegrations(),
    queryFn: () => tradingviewApi.listIntegrations(),
    enabled: isAuthenticated,
  });

  const emailStatusQuery = useQuery({
    queryKey: sourceKeys.emailStatus(),
    queryFn: () => emailApi.getStatus(),
    enabled: isAuthenticated,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: sourceKeys.all });
  };

  return {
    sources: listQuery.data || [],
    telegram: {
      status: telegramStatusQuery.data,
      channels: telegramChannelsQuery.data || [],
      initiateLogin: (payload) => telegramApi.initiateLogin(payload),
      completeLogin: (payload) => telegramApi.completeLogin(payload),
      logout: async () => {
        const result = await telegramApi.logout();
        invalidate();
        return result;
      },
      discoverChannels: async () => {
        const result = await telegramApi.discoverChannels();
        invalidate();
        return result;
      },
      optIn: async (payload) => {
        const result = await telegramApi.optIn(payload);
        invalidate();
        return result;
      },
      optOut: async (payload) => {
        const result = await telegramApi.optOut(payload);
        invalidate();
        return result;
      },
      startListening: async () => {
        const result = await telegramApi.startListening();
        invalidate();
        return result;
      },
      stopListening: async () => {
        const result = await telegramApi.stopListening();
        invalidate();
        return result;
      },
    },
    discord: {
      status: discordStatusQuery.data,
      guilds: discordGuildsQuery.data || [],
      connect: async (payload) => {
        const result = await discordApi.connect(payload);
        invalidate();
        return result;
      },
      disconnect: async () => {
        const result = await discordApi.disconnect();
        invalidate();
        return result;
      },
      optIn: async (payload) => {
        const result = await discordApi.optIn(payload);
        invalidate();
        return result;
      },
      optOut: async (payload) => {
        const result = await discordApi.optOut(payload);
        invalidate();
        return result;
      },
    },
    whatsapp: {
      status: whatsappStatusQuery.data,
      groups: whatsappGroupsQuery.data || [],
      subscribe: async (payload) => {
        const result = await whatsappApi.subscribe(payload);
        invalidate();
        return result;
      },
      unsubscribe: async () => {
        const result = await whatsappApi.unsubscribe();
        invalidate();
        return result;
      },
      optIn: async (payload) => {
        const result = await whatsappApi.optIn(payload);
        invalidate();
        return result;
      },
      optOut: async (payload) => {
        const result = await whatsappApi.optOut(payload);
        invalidate();
        return result;
      },
    },
    tradingview: {
      integrations: tradingviewIntegrationsQuery.data || [],
      createIntegration: async (payload) => {
        const result = await tradingviewApi.createIntegration(payload);
        invalidate();
        return result;
      },
      removeIntegration: async (integrationId) => {
        const result = await tradingviewApi.removeIntegration(integrationId);
        invalidate();
        return result;
      },
    },
    email: {
      status: emailStatusQuery.data,
      subscribe: async (payload) => {
        const result = await emailApi.subscribe(payload);
        invalidate();
        return result;
      },
      unsubscribe: async () => {
        const result = await emailApi.unsubscribe();
        invalidate();
        return result;
      },
    },
    createSource: async (payload) => {
      const result = await sourceApi.create(payload);
      invalidate();
      return result;
    },
    updateSource: async (sourceId, payload) => {
      const result = await sourceApi.update(sourceId, payload);
      invalidate();
      return result;
    },
    removeSource: async (sourceId) => {
      const result = await sourceApi.remove(sourceId);
      invalidate();
      return result;
    },
    isLoading:
      listQuery.isLoading ||
      telegramStatusQuery.isLoading ||
      discordStatusQuery.isLoading ||
      whatsappStatusQuery.isLoading ||
      tradingviewIntegrationsQuery.isLoading ||
      emailStatusQuery.isLoading,
  };
}

export default useSignalSources;