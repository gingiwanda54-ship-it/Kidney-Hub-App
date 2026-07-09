import { Video, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import Button from './Button';

const GoogleMeetEmbed = ({ meetingLink, title = 'Virtual Consultation' }) => {
  const [copied, setCopied] = useState(false);

  if (!meetingLink) {
    return (
      <div className="bg-kidney-cream rounded-lg p-8 text-center">
        <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Meeting link not available yet</p>
        <p className="text-sm text-gray-400 mt-2">
          The nurse will generate a link before the consultation
        </p>
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract meeting code from link for embed
  const getMeetingCode = (link) => {
    const match = link.match(/([a-z]{3}-[a-z]{4}-[a-z]{3})/i);
    return match ? match[1] : null;
  };

  const meetingCode = getMeetingCode(meetingLink);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-montserrat font-semibold text-kidney-charcoal flex items-center gap-2">
          <Video className="w-5 h-5 text-kidney-green" />
          {title}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
          >
            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
          </Button>
          <a
            href={meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-kidney-green text-white rounded-lg hover:bg-kidney-teal transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Meet
          </a>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {meetingCode ? (
          <iframe
            src={`https://meet.google.com/${meetingCode}?embed=true`}
            title={title}
            className="w-full h-full"
            allow="camera; microphone; fullscreen"
            style={{ border: 0 }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Click "Open in Meet" to join</p>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Before you start:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Ensure your camera and microphone are working</li>
          <li>• Find a quiet, well-lit space</li>
          <li>• Have your medical information ready</li>
        </ul>
      </div>
    </div>
  );
};

export default GoogleMeetEmbed;
