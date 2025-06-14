'use client';

import { useProjectManager } from '@/components/store/project';
import { Button } from '@onlook/ui/button';
import { Input } from '@onlook/ui/input';
import { Label } from '@onlook/ui/label';
import { observer } from 'mobx-react-lite';

export const ProjectTab = observer(() => {
    const projectManager = useProjectManager();
    const project = projectManager.project;

    if (!project) {
        return (
            <div className="p-6">
                <p className="text-gray-400">No project loaded</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Metadata Section */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-6">Metadata</h2>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name" className="text-sm text-gray-300 mb-2 block">
                            Name
                        </Label>
                        <Input
                            id="name"
                            defaultValue={project.name || "New Project"}
                            className="bg-gray-800 border-gray-600 text-white focus:border-gray-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="url" className="text-sm text-gray-300 mb-2 block">
                            URL
                        </Label>
                        <Input
                            id="url"
                            defaultValue={project.sandbox.url || "http://localhost:3208"}
                            className="bg-gray-800 border-gray-600 text-white focus:border-gray-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="path" className="text-sm text-gray-300 mb-2 block">
                            Path
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="path"
                                defaultValue="C:\\Users\\13606\\Documents\\Onlook\\Projects\\project-174"
                                className="bg-gray-800 border-gray-600 text-white focus:border-gray-500 flex-1"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                                📁
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Commands Section */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-2">Commands</h2>
                <p className="text-sm text-gray-400 mb-6">
                    Only update these if you know what you're doing!
                </p>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="install" className="text-sm text-gray-300 mb-2 block">
                            Install
                        </Label>
                        <Input
                            id="install"
                            defaultValue="npm install"
                            className="bg-gray-800 border-gray-600 text-white focus:border-gray-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="run" className="text-sm text-gray-300 mb-2 block">
                            Run
                        </Label>
                        <Input
                            id="run"
                            defaultValue="npm run dev"
                            className="bg-gray-800 border-gray-600 text-white focus:border-gray-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="build" className="text-sm text-gray-300 mb-2 block">
                            Build
                        </Label>
                        <Input
                            id="build"
                            defaultValue="npm run build"
                            className="bg-gray-800 border-gray-600 text-white focus:border-gray-500"
                        />
                    </div>
                </div>
            </div>

            {/* Reinstall Dependencies Section */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-2">Reinstall Dependencies</h2>
                <p className="text-sm text-gray-400 mb-4">
                    For when project failed to install dependencies
                </p>
                <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                    🔄 Reinstall
                </Button>
            </div>
        </div>
    );
});
