import React from 'react';
import VideoGrid from '../components/Videos/VideoGrid';

const Videos = () => {
    return (
        <div className="min-h-screen pt-24 px-4 pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Classes</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Master complex topics with our curated library of high-definition video tutorials and lectures.
                    </p>
                </div>

                <VideoGrid />
            </div>
        </div>
    );
};

export default Videos;
