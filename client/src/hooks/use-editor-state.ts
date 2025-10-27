import { useState, useCallback } from 'react';
import { EditorTab, ConsoleMessage, RuleValidation } from '@/lib/editor-types';

export function useEditorState() {
  const [activeTab, setActiveTab] = useState<string>('');
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [bottomPanelTab, setBottomPanelTab] = useState<string>('console');
  const [isBottomPanelExpanded, setIsBottomPanelExpanded] = useState(true);

  const openTab = useCallback((tab: EditorTab) => {
    setTabs(prev => {
      const existing = prev.find(t => t.id === tab.id);
      if (existing) {
        setActiveTab(tab.id);
        return prev;
      }
      const newTabs = [...prev, tab];
      setActiveTab(tab.id);
      return newTabs;
    });
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      if (activeTab === tabId && newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        setActiveTab('');
      }
      return newTabs;
    });
  }, [activeTab]);

  const updateTabContent = useCallback((tabId: string, content: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, content, isDirty: true }
        : tab
    ));
  }, []);

  const addConsoleMessage = useCallback((message: Omit<ConsoleMessage, 'id' | 'timestamp'>) => {
    const newMessage: ConsoleMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setConsoleMessages(prev => [...prev, newMessage]);
  }, []);

  const clearConsole = useCallback(() => {
    setConsoleMessages([]);
  }, []);

  return {
    activeTab,
    setActiveTab,
    tabs,
    openTab,
    closeTab,
    updateTabContent,
    consoleMessages,
    addConsoleMessage,
    clearConsole,
    bottomPanelTab,
    setBottomPanelTab,
    isBottomPanelExpanded,
    setIsBottomPanelExpanded,
  };
}
