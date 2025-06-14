'use client';

import { useEditorEngine } from '@/components/store/editor';
import { SettingsTabValue } from '@onlook/models';
import {
Dialog,
DialogContent,
} from '@onlook/ui/dialog';
import { Icons } from '@onlook/ui/icons';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { AITab } from './tabs/ai';
import { ProjectTab } from './tabs/project';
import { SiteTab } from './tabs/site';
import { DomainTab } from './tabs/domain';
import { VersionsTab } from './tabs/versions';
import { HomeTab } from './tabs/home';
import { PreferencesTab } from './tabs/preferences';
import { AdvancedTab } from './tabs/advanced';

export const SettingsDialog = observer(() => {
const editorEngine = useEditorEngine();
const [activeTab, setActiveTab] = useState('project');

const handleClose = () => {
    editorEngine.state.settingsOpen = false;
};

const handleTabChange = (value: string) => {
    setActiveTab(value);
};

const TabButton = ({ value, icon: Icon, children, isActive, onClick }: any) => (
    <button
        onClick={() => onClick(value)}
        className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-md transition-colors ${
            isActive 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
        }`}
    >
        <Icon className="h-4 w-4" />
        {children}
    </button>
);

const renderContent = () => {
    switch (activeTab) {
        case 'project':
            return <ProjectTab />;
        case 'site':
            return <SiteTab />;
        case 'domain':
            return <DomainTab />;
        case 'versions':
            return <VersionsTab />;
        case 'home':
            return <HomeTab />;
        case 'preferences':
            return <PreferencesTab />;
        case 'advanced':
            return <AdvancedTab />;
        case 'ai':
            return <AITab />;
        default:
            return null;
    }
};

return (
    <Dialog open={editorEngine.state.settingsOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-[90vw] min-w-[800px] w-[1000px] h-[85vh] p-0 bg-gray-900 text-white border-gray-700 flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 px-6 py-3 border-b border-gray-700">
                <h2 className="text-lg font-medium text-white">Settings</h2>
            </div>

            {/* Fixed Content Area with Grid Layout */}
            <div className="flex flex-1 min-h-0">
                {/* Sidebar - 1/3 width */}
                <div className="w-1/3 border-r border-gray-700 bg-gray-800/50">
                    <div className="p-4 h-full overflow-y-auto">
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-300 mb-3">Project</h3>
                            <div className="space-y-1">
                                <TabButton
                                    value="site"
                                    icon={Icons.Globe}
                                    isActive={activeTab === 'site'}
                                    onClick={handleTabChange}
                                >
                                    Site
                                </TabButton>
                                <TabButton
                                    value="domain"
                                    icon={Icons.Globe}
                                    isActive={activeTab === 'domain'}
                                    onClick={handleTabChange}
                                >
                                    Domain
                                </TabButton>
                                <TabButton
                                    value="project"
                                    icon={Icons.File}
                                    isActive={activeTab === 'project'}
                                    onClick={handleTabChange}
                                >
                                    Project
                                </TabButton>
                                <TabButton
                                    value="versions"
                                    icon={Icons.CounterClockwiseClock}
                                    isActive={activeTab === 'versions'}
                                    onClick={handleTabChange}
                                >
                                    Versions
                                </TabButton>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-300 mb-3">Page Settings</h3>
                            <div className="space-y-1">
                                <TabButton
                                    value="home"
                                    icon={Icons.ArrowDown}
                                    isActive={activeTab === 'home'}
                                    onClick={handleTabChange}
                                >
                                    Home
                                </TabButton>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-300 mb-3">Global Settings</h3>
                            <div className="space-y-1">
                                <TabButton
                                    value="ai"
                                    icon={Icons.Sparkles}
                                    isActive={activeTab === 'ai'}
                                    onClick={handleTabChange}
                                >
                                    AI Settings
                                </TabButton>
                                <TabButton
                                    value="preferences"
                                    icon={Icons.Person}
                                    isActive={activeTab === 'preferences'}
                                    onClick={handleTabChange}
                                >
                                    Preferences
                                </TabButton>
                                <TabButton
                                    value="advanced"
                                    icon={Icons.BorderAll}
                                    isActive={activeTab === 'advanced'}
                                    onClick={handleTabChange}
                                >
                                    Advanced
                                </TabButton>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area - 2/3 width */}
                <div className="w-2/3 overflow-y-auto p-6">
                    {renderContent()}
                </div>
            </div>
        </DialogContent>
    </Dialog>
);
});