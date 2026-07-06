import React, { useState, useRef, useEffect } from 'react';
import { IconShare, IconChevron, IconFile, IconDownload } from '../../icons';
import { ConfirmModal } from '../../ui/ConfirmModal';
import { MenuData } from '../../../types';
import { ToastType } from '../../../components/ui/Toast/ToastContext';
import { encryptMenu } from '../../../utils/crypto';
import { uploadEncryptedMenu, MenuRateLimitError } from '../../../utils/network';

interface ExportButtonProps {
  onJSONDownload: () => void;
  onExportPDF: () => void;
  menuData: MenuData;
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const LINK_SHARE_PRIVACY_NOTICE_KEY = 'link_share_privacy_notice_accepted';
const LINK_SHARE_PRIVACY_NOTICE_MESSAGE = [
  "To let you share a menu via a link, your menu needs to be uploaded to the server. For each shared menu, your browser generates a unique, random encryption key, encrypts the menu using AES-256-GCM, and uploads only the encrypted data. The server responds with a token, which can later be used to retrieve the encrypted menu.",
  "The link you receive includes both the token and the encryption key. The key is embedded in the URL fragment (the part after #), which is never sent to the server—ensuring that even if I wanted to, I couldn't decrypt your menu.",
  "Sharing links are valid for 5 days and automatically expire 5 minutes after they are used to import the menu—this will also delete the encrypted menu data from the server.",
  "For each menu, the server stores the time the data was uploaded and the encrypted menu content. No IP addresses or any other information that could link the encrypted data back to you are stored with the menu.",
  "Please keep your link private and avoid sharing it through untrusted channels, as anyone with the full link can access your menu."
];

export function ExportButton({
  onJSONDownload,
  onExportPDF,
  menuData,
  showToast
}: ExportButtonProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{left: string | number, right: string | number}>({ left: 'auto', right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showLinkSharePrivacyNotice, setshowLinkSharePrivacyNotice] = useState(false);
  const [pendingShareAsLink, setPendingShareAsLink] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleDropdown = () => {
    if (!isDropdownOpen) {
      calculateDropdownPosition();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 280; // w-[280px]
      
      // Force right-aligned positioning on small/medium screens
      if (viewportWidth < 768) {
        setDropdownPosition({ left: 'auto', right: 0 });
        return;
      }
      
      // On larger screens, check if dropdown would extend beyond right edge
      if (buttonRect.right + dropdownWidth > viewportWidth) {
        if (buttonRect.left - dropdownWidth >= 0) {
          setDropdownPosition({ left: 'auto', right: 0 });
        } else {
          // Calculate position to center dropdown under button
          const rightSpace = viewportWidth - buttonRect.right;
          const leftSpace = buttonRect.left;
          const buttonCenter = buttonRect.width / 2;
          const dropdownCenter = dropdownWidth / 2;
          
          // Position so dropdown stays in viewport
          setDropdownPosition({ 
            left: Math.max(-leftSpace, Math.min(rightSpace - dropdownWidth, buttonCenter - dropdownCenter)), 
            right: 'auto' 
          });
        }
      } else {
        // Default right alignment
        setDropdownPosition({ left: 'auto', right: 0 });
      }
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && 
          !buttonRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Recalculate position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isDropdownOpen) {
        calculateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isDropdownOpen]);

  const handleShareAsLink = async () => {
    if (typeof window !== 'undefined' && !localStorage.getItem(LINK_SHARE_PRIVACY_NOTICE_KEY)) {
      setshowLinkSharePrivacyNotice(true);
      setPendingShareAsLink(true);
      return;
    }
    setIsUploading(true);
    try {
      // Encrypt the menu
      const { encryptedData, urlSafeKey } = await encryptMenu(menuData);
      // Upload encrypted data
      const token = await uploadEncryptedMenu(encryptedData);
      // Assemble the link
      const baseUrl = window.location.origin + '/open';
      const link = `${baseUrl}?id=${encodeURIComponent(token)}#key=${encodeURIComponent(urlSafeKey)}`;
      setShareLink(link);
    } catch (err: unknown) {
      let message = 'Failed to share menu: ';
      if (err instanceof Error) {
        if (err.name === 'MenuRateLimitError' && err instanceof MenuRateLimitError) {
          // Handle rate limiting specifically
          if (err.waitTimeMinutes > 0) {
            message = `Rate limit reached. Please wait ${err.waitTimeMinutes} minutes before sharing again.`;
          } else {
            message = 'Rate limit reached. You\'ve made too many sharing requests. Please try again later.';
          }
        } else if (err.name === 'MenuEncryptionError') {
          message += 'Encryption failed. Please try again.';
        } else if (err.name === 'MenuNetworkError') {
          message += 'Network error. Please check your connection and try again.';
        } else {
          message += err.message;
        }
        console.error('ExportButton error:', err);
      } else {
        message += 'Unknown error';
        console.error('ExportButton unknown error:', err);
      }
      showToast(message, 'error');
    } finally {
      setIsUploading(false);
      setIsDropdownOpen(false);
    }
  };

  const handleAcceptNotice = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LINK_SHARE_PRIVACY_NOTICE_KEY, 'true');
    }
    setshowLinkSharePrivacyNotice(false);
    if (pendingShareAsLink) {
      setPendingShareAsLink(false);
      handleShareAsLink();
    }
  };

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="w-full px-3 md:px-4 py-3 bg-[rgba(148,188,194,0.15)] dark:bg-[rgba(79,139,149,0.15)] text-[var(--main-text-color)] rounded-md hover:bg-[rgba(148,188,194,0.3)] dark:hover:bg-[rgba(79,139,149,0.3)] transition-colors shadow-md text-sm font-medium flex items-center justify-center border border-[var(--main-text-color)] whitespace-nowrap"
        title="Share this menu"
        data-onboarding="share-button"
        disabled={isUploading}
      >
        <IconShare className="h-4 w-4 mr-1" />
        Export
        <IconChevron direction={isDropdownOpen ? "up" : "down"} className="h-4 w-4 ml-1" />
      </button>
      
      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div 
          className="hc-panel absolute mt-2 w-[280px] bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700"
          style={{ left: dropdownPosition.left, right: dropdownPosition.right }}
        >
          <div className="py-1">
            <button
              onClick={handleShareAsLink}
              className="flex flex-col px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              disabled={isUploading}
            >
              <div className="flex items-center">
                <IconShare className="h-4 w-4 mr-2 text-[var(--main-text-color)]" />
                <span>{isUploading ? 'Uploading...' : 'Export Copy as Link'}</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-6">End-to-end encrypted sharing.</span>
            </button>

            <button
              onClick={() => {
                onExportPDF();
                setIsDropdownOpen(false);
              }}
              className="flex flex-col px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
            >
              <div className="flex items-center">
                <IconDownload className="h-4 w-4 mr-2 text-[var(--main-text-color)]" />
                <span>Download PDF</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-6">Can be edited on the website.</span>
            </button>
            
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
            >
              <span className="font-medium">Advanced</span>
              <IconChevron
                direction={advancedOpen ? "up" : "down"}
                className="h-4 w-4 text-gray-500"
              />
            </button>
            
            {advancedOpen && (
              <div className="pl-2">
                <button
                  onClick={() => {
                    onJSONDownload();
                    setIsDropdownOpen(false);
                  }}
                  className="flex flex-col px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                >
                  <div className="flex items-center">
                    <IconFile className="h-4 w-4 mr-2 text-[var(--main-text-color)]" />
                    <span>Download Menu File (.rmenu)</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-6">JSON-encoded native format.</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={showLinkSharePrivacyNotice}
        onClose={() => {
          setshowLinkSharePrivacyNotice(false);
          setPendingShareAsLink(false);
          setIsDropdownOpen(false);
        }}
        onConfirm={handleAcceptNotice}
        title="Privacy Notice"
        message={LINK_SHARE_PRIVACY_NOTICE_MESSAGE}
        confirmText="Accept and Continue"
        cancelText="Don't Share"
        initialFocus="cancel"
      />
      {/* Share Link Modal */}
      {shareLink && (
        <div className="fixed inset-0 z-[2000] overflow-y-auto flex items-center justify-center p-4" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="absolute inset-0 bg-black/50 -z-10" onClick={() => setShareLink(null)}></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full relative z-10">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setShareLink(null)}
              aria-label="Close"
            >
              <span className="text-2xl">&times;</span>
            </button>
            <h2 className="text-lg font-bold mb-2 text-[var(--main-text-color)]">Shareable Link</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">Copy and share this link. Anyone with the link can access your menu. The link will expire after use or after 5 days.</p>
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded px-3 py-2 mb-4">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 bg-transparent text-xs text-gray-800 dark:text-gray-100 outline-none select-all"
                onFocus={e => e.target.select()}
              />
              <button
                className="ml-2 px-3 py-1 bg-[var(--main-text-color)] text-white rounded text-xs font-medium hover:bg-[var(--main-text-color-hover)] flex items-center justify-center min-w-[48px]"
                onClick={handleCopy}
                disabled={copied}
              >
                {copied ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  'Copy'
                )}
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Keep this link private. Anyone with the link can access your menu.</div>
          </div>
        </div>
      )}
    </div>
  );
} 