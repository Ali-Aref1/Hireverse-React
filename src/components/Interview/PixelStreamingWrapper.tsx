import { useEffect, useRef } from 'react';
import {
    Config,
    AllSettings,
    PixelStreaming
} from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.5';

export interface PixelStreamingWrapperProps {
    initialSettings?: Partial<AllSettings>;
}

export const PixelStreamingWrapper = ({
    initialSettings
}: PixelStreamingWrapperProps) => {
    const videoParent = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (videoParent.current) {
            // Configure settings to minimize logging
            const settings = {
                ...initialSettings,
                // Set log level to disable or minimize logs
                LogLevel: 0, // 0 = Disabled, 1 = Error, 2 = Warning, 3 = Info, 4 = Debug
                includeStack: false
            };
            
            const config = new Config({ initialSettings: settings });
            const streaming = new PixelStreaming(config, {
                videoElementParent: videoParent.current
            });

            return () => {
                try {
                    streaming.disconnect();
                } catch {}
            };
        }
    }, []);

    return (
        <div
            className="relative overflow-hidden  h-full"
            style={{ aspectRatio: '16 / 9', width: '100%', minWidth: 0, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <div
                className="w-full h-full"
                ref={videoParent}
            />
        </div>
    );
};
