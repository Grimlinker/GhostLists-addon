import { useState } from "react";
import { Button } from "@/ui/button";
import { Check, Copy, ExternalLink } from "lucide-react";

interface Props {
  manifestUrl: string;
}

export function InstallButtons({ manifestUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(manifestUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mt-6">
      <a
        href={`stremio://${manifestUrl}`}
        className="bg-gradient-to-r from-pink-300 to-purple-300 text-white font-semibold px-6 py-2 rounded-xl shadow hover:opacity-90 transition-all flex items-center gap-2"
      >
        <ExternalLink size={18} />
        Install
      </a>

      <Button
        onClick={handleCopy}
        className="bg-white text-pink-600 border border-pink-300 hover:bg-pink-50 transition-all font-medium flex items-center gap-2 px-4 py-2 rounded-xl"
      >
        {copied ? (
          <>
            <Check size={18} /> Copied!
          </>
        ) : (
          <>
            <Copy size={18} /> Copy Link
          </>
        )}
      </Button>
    </div>
  );
}

