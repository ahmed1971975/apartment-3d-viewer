#!/usr/bin/env node

/**
 * Video Recorder for 3D Apartment Viewer
 * Captures apartment tour and saves as MP4
 * 
 * Prerequisites:
 * - Node.js installed
 * - FFmpeg installed (npm install fluent-ffmpeg)
 * - Puppeteer for headless browser (npm install puppeteer)
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CONFIG = {
    width: 1920,
    height: 1080,
    fps: 30,
    duration: 60, // seconds - tour duration
    outputPath: './apartment-tour.mp4'
};

async function recordApartmentTour() {
    console.log('🎬 Starting Apartment Tour Recording...');
    console.log(`📹 Resolution: ${CONFIG.width}x${CONFIG.height} @ ${CONFIG.fps}fps`);
    console.log(`⏱️  Duration: ${CONFIG.duration}s`);
    
    let browser;
    try {
        // Launch headless browser
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--disable-blink-features=AutomationControlled']
        });

        const page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({
            width: CONFIG.width,
            height: CONFIG.height,
            deviceScaleFactor: 1
        });

        // Navigate to the apartment viewer
        const htmlPath = `file://${path.resolve('./index.html')}`;
        console.log(`\n📂 Loading: ${htmlPath}`);
        
        await page.goto(htmlPath, { waitUntil: 'networkidle2' });

        // Wait for Three.js to load
        await page.waitForTimeout(3000);
        console.log('✅ Page loaded');

        // Start recording frames
        console.log('\n🎥 Recording frames...');
        const frames = [];
        const frameCount = CONFIG.fps * CONFIG.duration;

        // Inject tour controller
        await page.evaluate(() => {
            window.recordingMode = true;
        });

        // Trigger the tour
        await page.evaluate(() => {
            if (window.startWalkthrough) {
                window.startWalkthrough();
            }
        });

        console.log(`📸 Capturing ${frameCount} frames...`);
        
        // Capture screenshots
        for (let i = 0; i < frameCount; i++) {
            const frame = await page.screenshot({ encoding: 'binary' });
            frames.push(frame);
            
            const progress = Math.round((i / frameCount) * 100);
            process.stdout.write(`\r   Progress: ${progress}% (${i}/${frameCount})`);
            
            // Wait for next frame
            await page.waitForTimeout(1000 / CONFIG.fps);
        }
        
        console.log('\n✅ Frame capture complete\n');

        // Create video from frames using FFmpeg
        await createVideoFromFrames(frames);

        console.log(`\n✨ Video saved to: ${CONFIG.outputPath}`);
        console.log('🎉 Recording complete!');

    } catch (error) {
        console.error('❌ Error during recording:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function createVideoFromFrames(frames) {
    const ffmpeg = require('fluent-ffmpeg');
    
    // Create temporary directory for frames
    const tempDir = './temp_frames';
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    console.log('💾 Writing frames to disk...');
    
    // Save frames as image files
    for (let i = 0; i < frames.length; i++) {
        const framePath = path.join(tempDir, `frame_${String(i).padStart(6, '0')}.png`);
        fs.writeFileSync(framePath, frames[i]);
        
        if (i % 30 === 0) {
            process.stdout.write(`\r   Saved ${i}/${frames.length} frames`);
        }
    }
    
    console.log('\n✅ Frames saved\n');
    console.log('🎬 Converting to MP4...');

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(path.join(tempDir, 'frame_%06d.png'))
            .inputFPS(CONFIG.fps)
            .output(CONFIG.outputPath)
            .outputOptions([
                '-c:v libx264',
                '-pix_fmt yuv420p',
                '-preset medium',
                '-crf 23'
            ])
            .on('progress', (progress) => {
                process.stdout.write(`\r   FFmpeg: ${Math.round(progress.percent)}%`);
            })
            .on('end', () => {
                console.log('\n✅ Video conversion complete');
                
                // Cleanup temp frames
                console.log('🧹 Cleaning up temporary files...');
                fs.rmSync(tempDir, { recursive: true });
                console.log('✅ Cleanup complete');
                
                resolve();
            })
            .on('error', (err) => {
                console.error('\n❌ FFmpeg error:', err);
                reject(err);
            })
            .run();
    });
}

// Alternative method: Using Canvas recording with MediaRecorder
async function recordWithMediaRecorder() {
    console.log('🎬 Alternative: Using MediaRecorder API\n');
    
    const recordScript = `
        // This script can be run in the browser console
        async function recordApartment() {
            const canvas = document.querySelector('canvas');
            const stream = canvas.captureStream(30); // 30 fps
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 5000000
            });
            
            const chunks = [];
            mediaRecorder.addEventListener('dataavailable', (e) => {
                chunks.push(e.data);
            });
            
            mediaRecorder.addEventListener('stop', () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'apartment-tour.webm';
                a.click();
                console.log('✅ Video downloaded!');
            });
            
            mediaRecorder.start();
            console.log('🎥 Recording started... click "Start Tour" button');
            
            // Auto-stop after 60 seconds
            setTimeout(() => {
                mediaRecorder.stop();
                console.log('⏹️ Recording stopped');
            }, 60000);
        }
        
        recordApartment();
    `;
    
    console.log('Run this in your browser console while viewing the apartment:');
    console.log('─'.repeat(60));
    console.log(recordScript);
    console.log('─'.repeat(60));
}

// Main execution
if (require.main === module) {
    // Check if FFmpeg and Puppeteer are installed
    try {
        require('puppeteer');
        require('fluent-ffmpeg');
        recordApartmentTour();
    } catch (error) {
        console.log('⚠️  Missing dependencies\n');
        console.log('Install required packages:');
        console.log('npm install puppeteer fluent-ffmpeg\n');
        console.log('Then run: npm run record\n');
        console.log('Alternative method (browser-based):');
        recordWithMediaRecorder();
    }
}

module.exports = { recordApartmentTour, recordWithMediaRecorder };
