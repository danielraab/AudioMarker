import { Bookmark, FileMusic, FlagTriangleRight, Section, Share2 } from "lucide-react";

export default function PublicLandingPage() {
  return (<>
    <h1 className="flex items-center text-5xl font-extrabold tracking-tight sm:text-[5rem]">
      <img
        src="/audio-marker-logo.svg"
        alt="Audio Marker Logo"
        className="h-16 w-16 object-contain transition-transform hover:scale-105"
      />
      <span>Audio Marker</span>
    </h1>
    <div className="max-w-3xl flex flex-col gap-4 sm:grid sm:grid-cols-2 md:gap-8">
      <div className="flex flex-col gap-4 rounded-xl p-4">
        <FileMusic />
        <h3 className="text-2xl font-bold">Upload your audio file</h3>
        <div className="text-lg">
          Currently you can only upload MP3 files. More formats may come in the future.
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-xl p-4" >
        <Bookmark />
        <h3 className="text-2xl font-bold">Set marker on your file</h3>
        <div className="text-lg">
          After uploading, you can set markers on your audio file to highlight important sections.
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-xl p-4" >
        <Share2 />
        <h3 className="text-2xl font-bold">Share your marker</h3>
        <div className="text-lg">
          Share a read-only link with others so they can view the markers you set on your audio file.
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-xl p-4" >
        <FlagTriangleRight />
        <h3 className="text-2xl font-bold">Marker in Browser</h3>
        <div className="text-lg">
          User with a read-only link can listen to the audio and see the markers you set, and they can set own marker which are available only in their browser.
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-xl p-4 col-span-2" >
        <Section />
        <h3 className="text-2xl font-bold">Be careful</h3>
        <div className="text-lg">
          Upload only files were you own the rights to. Do not upload sensitive or private information. Read-only link can be used by anyone who has it, so share it only with people you trust.
        </div>
      </div>
    </div>
  </>);
}