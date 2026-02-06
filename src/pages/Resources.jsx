import React from 'react';
import ResourceList from '../components/Resources/ResourceList';

const Resources = () => {
    return (
        <div className="min-h-screen pt-24 px-4 pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Toolkit</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        A hand-picked collection of the best tools, platforms, and references to supercharge your learning process.
                    </p>
                </div>

                <ResourceList />
            </div>
        </div>
    );
};

export default Resources;
