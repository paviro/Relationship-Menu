import Link from 'next/link';
import { Container } from '../components/ui/Container';

export default function PrivacyPolicy() {
  return (
    <Container className="max-w-7xl">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--main-text-color)] mb-4">Privacy Policy</h1>
        <div className="w-24 h-1 bg-[var(--main-bg-color)] mx-auto rounded-full"></div>
      </div>
      
      {/* Privacy Features Highlight Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-8 mb-10 transition-all hover:shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-[var(--main-bg-color)] bg-opacity-20 dark:bg-opacity-40 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--main-text-color)] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[var(--main-text-color)]">Privacy by Design</h2>
        </div>
        
        <div className="pl-3 sm:pl-14">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 sm:mb-8 text-base sm:text-lg">
            This application was designed with privacy at its core. Unlike most web services, your personal relationship data stays completely private.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-xl transition-all hover:shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-[var(--main-text-color)]">100% Local Processing</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-3 sm:ml-11">
                All menu data is processed and stored entirely within your browser using local storage. Nothing about your relationship preferences is ever transmitted to any servers without your explicit consent and initiation.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-xl transition-all hover:shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-[var(--main-text-color)]">No Tracking Cookies</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-3 sm:ml-11">
                No cookies are used to track your behavior or preferences. Your browsing remains private to you.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50/70 dark:bg-blue-900/20 border-l-4 border-blue-300 dark:border-blue-700 p-4 sm:p-6 rounded-r-xl mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start">
              <div className="flex-shrink-0 mr-3 mb-2 sm:mb-0 sm:mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 text-blue-700 dark:text-blue-400">Sharing Your Menu with Others</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  There are three ways to share your relationship menu with others, both designed with your privacy in mind:
                </p>
                
                <div className="mt-4 space-y-4">
                <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 13a5 5 0 007.07 0l1.414-1.414a5 5 0 00-7.07-7.07L10 5.93M14 11a5 5 0 00-7.07 0l-1.414 1.414a5 5 0 007.07 7.07l1.414-1.414" />
                    </svg>
                      Share as Link
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm ml-3 sm:ml-6 mb-2">
                      Share a copy of your menu via an end-to-end encrypted link. Your menu is encrypted on your device and only the encrypted data is uploaded to the server without the encryption key.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Exporting as PDF
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm ml-3 sm:ml-6 mb-2">
                      Export your menu as a beautifully formatted PDF document that's ready for printing or sharing.
                      The exported PDF file can be opened on any device with a PDF viewer and be edited on this website.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Downloading as JSON File
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm ml-3 sm:ml-6 mb-2">
                      Download your menu as a JSON file. If you don't know what that means this likely isn't for you.
                      Can be used to put the menu into a git repository or other version control system.
                    </p>
                  </div>
                </div>
                
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">Privacy Benefits of All Sharing Methods</h4>
                <ul className="list-disc ml-3 sm:ml-5 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Your personal data remains on your device until you explicitly choose to share it</li>
                  <li>You maintain absolute control over who can access your relationship preferences</li>
                </ul>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div className="bg-blue-50/70 dark:bg-blue-900/30 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">Link Advantages</h5>
                    <ul className="list-disc ml-4 sm:ml-5 text-sm text-gray-700 dark:text-gray-300">
                      <li>Protected with end-to-end encryption</li>
                      <li>Valid for 5 days / 5 minutes after it is used</li>
                      <li>Easy to share via messaging apps</li>
                    </ul>
                  </div>
                  <div className="bg-green-50/70 dark:bg-green-900/30 p-2 rounded-lg border border-green-100 dark:border-green-800">
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">PDF Advantages</h5>
                    <ul className="list-disc ml-4 sm:ml-5 text-sm text-gray-700 dark:text-gray-300">
                      <li>Professional presentation</li>
                      <li>Ready for printing</li>
                      <li>Widely compatible format</li>
                      <li>Contains json menu data</li>
                      <li>Editable on this website</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50/70 dark:bg-yellow-900/30 p-2 rounded-lg border border-yellow-100 dark:border-yellow-800">
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">JSON File Advantages</h5>
                    <ul className="list-disc ml-4 sm:ml-5 text-sm text-gray-700 dark:text-gray-300">
                      <li>Permanent offline storage</li>
                      <li>Easy backup and archiving</li>
                      <li>Version control possibilities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legal Requirements Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-8 mb-10 transition-all hover:shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-[var(--main-bg-color)] bg-opacity-20 dark:bg-opacity-40 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--main-text-color)] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[var(--main-text-color)]">Legal Requirements</h2>
        </div>
        
        <div className="pl-3 sm:pl-14 space-y-8">
          {/* Contact Information Section */}
          <div>
            <h3 className="text-xl font-medium mb-6 text-[var(--main-text-color)]">1. General information and mandatory information</h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-xl">
              <div className="flex items-center border-b border-gray-200 dark:border-gray-600 pb-4 mb-6">
                <h4 className="text-lg font-bold text-[var(--main-text-color)]">Data Controller Information</h4>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="mb-6 md:mb-0 md:pr-6 md:w-1/2">
                  <p className="font-medium text-lg text-[var(--main-text-color)] mb-2">Address</p>
                  <p className="mb-1 dark:text-gray-300">Paul-Vincent Roll</p>
                  <p className="mb-1 dark:text-gray-300">Gürtelstraße 13</p>
                  <p className="mb-1 dark:text-gray-300">13088 Berlin</p>
                  <p className="dark:text-gray-300">Germany</p>
                </div>
                
                <div className="md:border-l border-gray-200 dark:border-gray-600 md:pl-6 md:w-1/2">
                  <p className="font-medium text-lg text-[var(--main-text-color)] mb-2">Contact</p>
                  <p className="flex items-center mb-3 dark:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[var(--main-text-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +49 173 1626294
                  </p>
                  <p className="flex items-center dark:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[var(--main-text-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    paul-vincent@relationshipmenu.org
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-gray-700 leading-relaxed">
                  The responsible party is the natural or legal person who alone or jointly with others decides on the purposes and means of processing personal data (names, email addresses, etc.).
                </p>
              </div>
            </div>
          </div>
          
          {/* Data Collection Section */}
          <div>
            <h3 className="text-xl font-medium mb-3 text-[var(--main-text-color)]">2. Data collection on this website</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-xl mb-6">
              <h4 className="text-lg font-medium mb-3 text-[var(--main-text-color)]">2.1. Sharing Your Menu via Link</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                When you share a menu via a link, an encrypted copy of your menu is uploaded to the app's server.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Encryption happens locally on your device using AES-256-GCM. A new encryption key is generated each time you create a sharing link.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Only the encrypted data is uploaded and the decryption key is never sent to the server. Instead, it's embedded in the link as a URL fragment after the # symbol, ensuring that even I cannot decrypt your menu.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Shared links remain valid for up to 5 days and expire automatically 5 minutes after the menu data is requested and the menu is imported in the app or on the website. After expiration, the data is deleted from the server. To enable this, the server stores a timestamp of when the menu was uploaded.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Menus are only uploaded when you explicitly choose to share them. No menus are transmitted to the server without your direct action.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded-r-lg">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  Menu data is stored and processed based on your consent under Art. 6(1)(a) and Art. 9(2)(a) of the GDPR.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You may request deletion of an uploaded menu by emailing me the menu ID from the link. Please be sure to remove the decryption key before sending.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-xl">
              <h4 className="text-lg font-medium mb-3 text-[var(--main-text-color)]">2.2. Server log files</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                When you access the website, certain technical data is automatically collected and stored in server log files. This helps ensure the security, stability, and proper functioning of the service.
              </p>
              
              <div className="bg-white dark:bg-gray-600 p-4 rounded-lg border border-gray-200 dark:border-gray-500 mb-4">
                <p className="font-medium mb-2 text-gray-800 dark:text-gray-200">These log files include:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <ul className="list-disc ml-4 sm:ml-6 text-gray-700 dark:text-gray-300 space-y-1">
                    <li>IP address of the device making the request</li>
                    <li>Host name of the requesting device</li>
                    <li>Timestamp and duration of the request</li>
                    <li>Request line indicating the requested resource</li>
                  </ul>
                  <ul className="list-disc ml-4 sm:ml-6 text-gray-700 dark:text-gray-300 space-y-1">
                    <li>HTTP status code returned by the server</li>
                    <li>Amount of data transmitted during the request</li>
                    <li>User agent string (including browser type and version, operating system)</li>
                    <li>Referrer URL (the webpage that linked to the resource)</li>
                  </ul>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                This data may also be used to detect and prevent malicious activity, such as abuse or unauthorized access attempts, including implementing rate limiting on IP addresses to protect the service from overload or attacks.
              </p>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded-r-lg">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  The processing of this data is based on Article 6(1)(f) GDPR (legitimate interests), aimed at ensuring service security, stability, and abuse prevention.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Log files are retained for a maximum of fourteen (14) days and are not linked with any other personal data.
                </p>
              </div>
            </div>
          </div>
          
          {/* Third Party Section */}
          <div>
            <h3 className="text-xl font-medium mb-3 text-[var(--main-text-color)]">3. Data Processing by Third-Party Providers</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-500 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-[var(--main-text-color)]">phasedrei</h4>
              </div>
              
              <div className="ml-3 sm:ml-11 space-y-3">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  This website uses <a href="https://phasedrei.de" className="text-[var(--main-text-color)] hover:underline" target="_blank" rel="noopener noreferrer">phasedrei</a>, Richard-Wagner-Ring 2E, 67227 Frankenthal (Pfalz) as the hosting provider.
                </p>
                
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  The collected data mentioned in Section 2 is processed and stored on servers operated by phasedrei.
                </p>
                
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  A data processing agreement is in place with phasedrei, ensuring full compliance with the strict requirements of German data protection authorities.
                </p>
                
                <div className="flex items-center bg-white dark:bg-gray-600 p-3 rounded-lg border border-gray-200 dark:border-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    The privacy policy of phasedrei can be found at: <a href="https://phasedrei.de/datenschutz/" className="text-[var(--main-text-color)] hover:underline break-words" target="_blank" rel="noopener noreferrer">https://phasedrei.de/datenschutz/</a>
                  </p>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  The use of phasedrei is based on a legitimate interest (Art. 6 (1)(f) GDPR) in ensuring the secure and reliable hosting of this service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8 sm:mt-12 mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center px-4 sm:px-6 py-3 bg-[var(--main-text-color)] text-white rounded-lg hover:bg-[var(--main-text-color-hover)] transition-colors shadow-md hover:shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </Container>
  );
} 