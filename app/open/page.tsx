// /open/ route: Lets users open a menu in the mobile app via a custom URL scheme. Shows TestFlight link, tries to redirect to the app, and if it fails, shows manual instructions. Uses Container and matches site style.
// See: https://relationshipmenu.org/open?id=...#key=...

"use client";

import { useEffect, useState, useSyncExternalStore, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoadingIndicator } from "../components/ui/LoadingIndicator";
import { fetchEncryptedMenu, deleteSharedMenu } from '../utils/network';
import { decryptMenuWithUrlSafeKey } from '../utils/crypto';
import { useMenuImport } from '../components/FileSelector/useMenuImport';
import { ErrorDisplay } from '../components/FileSelector/ErrorDisplay';
import { checkMenuExists, MenuRateLimitError } from '../utils/network';
import IconFile from '../components/icons/IconFile';
import IconTrash from '../components/icons/IconTrash';
import { APP_CONFIG } from '../config';

// The decryption key lives in the URL fragment (#key=...), which isn't part of
// searchParams. Read it as an external store so SSR yields null and the client
// picks it up post-hydration without a state-setting effect.
function subscribeHash(callback: () => void) {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

function getKeySnapshot(): string | null {
  const match = window.location.hash.match(/key=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getKeyServerSnapshot(): string | null {
  return null;
}

function getAppUrl(id: string | null, key: string | null) {
  if (!id) return null;
  let url = `${APP_CONFIG.APP_URL_SCHEME}://importMenuFromLink?id=${encodeURIComponent(id)}`;
  if (key) url += `#key=${encodeURIComponent(key)}`;
  return url;
}

function OpenMenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [importing, setImporting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [exists, setExists] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isRateLimit: boolean;
    waitTimeMinutes: number;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const id = searchParams.get("id");
  const key = useSyncExternalStore(subscribeHash, getKeySnapshot, getKeyServerSnapshot);

  useEffect(() => {
    async function check() {
      if (!id) {
        setExists(false);
        setChecking(false);
        return;
      }
      setChecking(true);
      setRateLimitInfo(null); // Reset rate limit info
      try {
        const result = await checkMenuExists(id);
        setExists(result);
      } catch (err: unknown) {
        let message = 'Failed to check menu.';
        if (err instanceof Error) {
          if (err.name === 'MenuRateLimitError' && err instanceof MenuRateLimitError) {
            // Handle rate limiting specifically
            setRateLimitInfo({
              isRateLimit: true,
              waitTimeMinutes: err.waitTimeMinutes
            });
            setExists(false);
          } else if (err.name === 'MenuNetworkError') {
            message = 'Network error while checking menu. Please try again.';
            setErrorMsg(message);
            setExists(false);
          } else {
            message = err.message;
            setErrorMsg(message);
            setExists(false);
          }
          console.error('checkMenuExists error:', err);
        } else {
          console.error('checkMenuExists unknown error:', err);
          setErrorMsg(message);
          setExists(false);
        }
      } finally {
        setChecking(false);
      }
    }
    check();
  }, [id]);

  const appUrl = getAppUrl(id, key);

  // Use the new import hook
  const {
    importMenu,
    ImportConflictModal,
    error,
    setError,
  } = useMenuImport({
    onComplete: (menuId) => router.push(`/editor?id=${menuId}&mode=view`)
  });

  const handleOpenInApp = () => {
    if (!appUrl) return;
    setRedirecting(true);
    setShowInstructions(false);
    window.location.href = appUrl;
    setTimeout(() => {
      setRedirecting(false);
      setShowInstructions(true);
    }, 2000);
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setErrorMsg(null);
    setRateLimitInfo(null);
    try {
      await deleteSharedMenu(id);
      setExists(false);
      setDeleted(true);
    } catch (err: unknown) {
      let message = 'Failed to delete menu link.';
      if (err instanceof Error) {
        if (err instanceof MenuRateLimitError) {
          setRateLimitInfo({ isRateLimit: true, waitTimeMinutes: err.waitTimeMinutes });
        } else if (err.name === 'MenuNetworkError') {
          message = 'Network error while deleting. Please try again.';
          setErrorMsg(message);
        } else {
          message = err.message;
          setErrorMsg(message);
        }
        console.error('deleteSharedMenu error:', err);
      } else {
        console.error('deleteSharedMenu unknown error:', err);
        setErrorMsg(message);
      }
    } finally {
      setDeleting(false);
    }
  };

  // Web App import logic
  const handleImportWebApp = async () => {
    setImporting(true);
    setError(null);
    setRateLimitInfo(null); // Reset rate limit info
    try {
      if (!id || !key) {
        setError('Missing menu id or key in the link.');
        setImporting(false);
        return;
      }
      const encryptedData = await fetchEncryptedMenu(id);
      const menu = await decryptMenuWithUrlSafeKey(encryptedData, key);
      importMenu(menu);
    } catch (err: unknown) {
      let message = 'Failed to import menu: ';
      if (err instanceof Error) {
        if (err.name === 'MenuRateLimitError' && err instanceof MenuRateLimitError) {
          // Handle rate limiting specifically for import
          setRateLimitInfo({
            isRateLimit: true,
            waitTimeMinutes: err.waitTimeMinutes
          });
        } else if (err.name === 'MenuEncryptionError') {
          message += 'Decryption failed. The link or key may be invalid.';
          setError(message);
        } else if (err.name === 'MenuNetworkError') {
          message += 'Network error. The menu may not exist or your connection failed.';
          setError(message);
        } else {
          message += err.message;
          setError(message);
        }
        console.error('OpenMenu import error:', err);
      } else {
        message += 'Unknown error';
        console.error('OpenMenu unknown error:', err);
        setError(message);
      }
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f7fafc] to-[#e3e8ee] dark:from-[#1a202c] dark:to-[#232946] p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#181c24] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 px-8 py-10 flex flex-col items-center">
        {ImportConflictModal}
        {importing ? (
          <LoadingIndicator message="Importing menu..." />
        ) : checking ? (
          <LoadingIndicator message="Checking menu link..." />
        ) : rateLimitInfo?.isRateLimit ? (
          <>
            <div className="flex flex-col items-center">
              <svg width="48" height="48" fill="none" viewBox="0 0 48 48" className="mb-4">
                <circle cx="24" cy="24" r="24" fill="#FEE2E2"/>
                <path d="M24 16v8M24 30v2" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <h1 className="text-2xl font-bold text-[#1a202c] dark:text-[#f5f6fa] mb-2 text-center">Rate Limit Reached</h1>
              <p className="text-[#222] dark:text-[#e5e7eb] text-center mb-4">
                You've made too many requests to the link sharing service.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4 w-full">
                {rateLimitInfo.waitTimeMinutes > 0 ? (
                  <p className="text-red-600 dark:text-red-300 text-sm text-center mt-2 font-semibold">
                    Please wait {rateLimitInfo.waitTimeMinutes} minutes before trying again.
                  </p>
                ) : (
                  <p className="text-red-600 dark:text-red-300 text-sm text-center mt-2 font-semibold">
                    Please try again later.
                  </p>
                )}
              </div>
              <button 
                onClick={() => router.replace('/')} 
                className="mt-2 px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition"
              >
                Go to Home
              </button>
            </div>
          </>
        ) : deleted ? (
          <>
            <div className="flex flex-col items-center">
              <svg width="48" height="48" fill="none" viewBox="0 0 48 48" className="mb-4">
                <circle cx="24" cy="24" r="24" fill="#DCFCE7"/>
                <path d="M16 24l6 6 10-12" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h1 className="text-2xl font-bold text-[#1a202c] dark:text-[#f5f6fa] mb-2 text-center">Menu link deleted</h1>
              <p className="text-[#222] dark:text-[#e5e7eb] text-center mb-4">The shared link was deleted successfully.</p>
              <button onClick={() => router.replace('/')} className="mt-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition">Go to Home</button>
            </div>
          </>
        ) : !exists ? (
          <>
            <div className="flex flex-col items-center">
              <svg width="48" height="48" fill="none" viewBox="0 0 48 48" className="mb-4"><circle cx="24" cy="24" r="24" fill="#FDE68A"/><path d="M24 14v10" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round"/><circle cx="24" cy="32" r="1.5" fill="#B45309"/></svg>
              <h1 className="text-2xl font-bold text-[#1a202c] dark:text-[#f5f6fa] mb-2 text-center">Menu not found or expired</h1>
              <p className="text-[#222] dark:text-[#e5e7eb] text-center">This menu link is no longer valid.</p>
              <p className="text-[#222] dark:text-[#e5e7eb] text-center mb-4">It may have expired or been deleted.</p>
              <button onClick={() => router.replace('/')} className="mt-2 px-5 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-[#1a202c] font-semibold transition">Go to Home</button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="mb-4 h-12 w-12 rounded-full bg-[#9ec6cc] flex items-center justify-center">
                <IconFile className="h-6 w-6 text-[#2d5c63]" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#1a202c] dark:text-[#f5f6fa] mb-2 text-center">Shared Relationship Menu</h1>
              <p className="text-[#222] dark:text-[#e5e7eb] text-center mb-2">You can import this menu in the app or in the web version.</p>
            </div>
            <div className="flex flex-col gap-4 w-full">
              {/* App Buttons */}
                <a
                  href={APP_CONFIG.APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#25697f] to-[#4f8b95] text-white font-semibold text-base shadow-md hover:brightness-110 transition"
                >
                  Get the iOS App
                </a>
              <button
                onClick={handleOpenInApp}
                disabled={redirecting || !appUrl}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25697f] text-white font-semibold text-base shadow-md hover:bg-[#2d5c63] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Open in App
              </button>

              {showInstructions && (
                <div className="mt-4 w-full bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-xl p-4">
                  <h2 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Didn't work?</h2>
                  <ul className="list-disc pl-5 text-sm text-[#222] dark:text-[#e5e7eb] space-y-2">
                    <li>Make sure the Relationship Menu app is installed from the App Store.</li>
                    <li>If it is installed and this page didn't open the app, you can manually copy the link below:</li>
                  </ul>
                  <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded break-all text-xs select-all text-[#222] dark:text-[#e5e7eb]">
                    {typeof window !== "undefined" ? window.location.href : ""}
                  </div>
                  <ul className="list-disc pl-5 text-sm text-[#222] dark:text-[#e5e7eb] mt-2 space-y-2">
                    <li>Open the app, press the <b>New Menu</b> button (top right in the navbar), then choose <b>Import from Link</b>.</li>
                  </ul>
                </div>
              )}

              {/* Separator */}
              <div className="flex items-center my-2">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                <span className="mx-3 text-gray-400 dark:text-gray-500 text-sm">or</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
              </div>

              {/* Web Button */}
              {id && key && (
                <button
                  onClick={handleImportWebApp}
                  disabled={importing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#25697f] bg-white dark:bg-[#232946] text-[#25697f] dark:text-[#9ec6cc] font-semibold text-base shadow-sm hover:bg-[#f0f8fa] dark:hover:bg-[#1a202c] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {importing ? 'Importing...' : 'Open in Web Version'}
                </button>
              )}

              {/* Delete Button - Subtle placement after main actions */}
              {id && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-3"
                  aria-label="Delete shared link"
                >
                  <IconTrash className="h-4 w-4" />
                  {deleting ? 'Deleting link…' : 'Delete this shared link'}
                </button>
              )}
            </div>
            {redirecting && <LoadingIndicator message="Trying to open the app..." />}
            <ErrorDisplay error={error || errorMsg} />
          </>
        )}
      </div>
      
    </div>
  );
}

export default function OpenMenuPage() {
  return (
    <Suspense>
      <OpenMenuContent />
    </Suspense>
  );
}
