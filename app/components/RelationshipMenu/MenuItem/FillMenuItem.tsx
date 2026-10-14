import React, { useState, useEffect, useRef, useCallback } from "react";
import { MenuItem, RichTextJSONPart } from "../../../types";
import { IconPicker, renderIcon, ICON_OPTIONS } from "../../ui/IconPicker";
import { IconChevron } from "../../icons";
import { getItemSpanClasses } from "./utils";
import { renderRichText, isRichTextEmpty } from "../../../utils/richTextUtils";
import { RichTextEditor } from "../../ui/RichTextEditor";
import { useTheme } from "../../ThemeProvider";

interface FillMenuItemProps {
  catIndex: number;
  itemIndex: number;
  item: MenuItem;
  onIconChange: (
    catIndex: number,
    itemIndex: number,
    newIcon: string | null,
  ) => void;
  onNoteChange: (
    catIndex: number,
    itemIndex: number,
    newNote: RichTextJSONPart[] | null,
  ) => void;
  autoResizeTextarea: (element: HTMLTextAreaElement) => void;
}

export function FillMenuItem({
  catIndex,
  itemIndex,
  item,
  onIconChange,
  onNoteChange,
}: FillMenuItemProps) {
  const { preferences } = useTheme();
  const hoverToOpenPicker = preferences.hoverToOpenPicker === true;
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [pickerOpenMode, setPickerOpenMode] = useState<"hover" | "explicit" | null>(null);
  if (!hoverToOpenPicker && pickerOpenMode === "hover") {
    setPickerOpenMode(null);
  }
  const isPickerOpen = pickerOpenMode !== null;
  const pickerTriggerRef = useRef<HTMLButtonElement>(null);
  const pickerOptionsRef = useRef<HTMLDivElement>(null);
  const pickerWrapperRef = useRef<HTMLDivElement>(null);
  const noteEditorRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPointerOverPicker = useRef(false);

  const cancelPickerClose = useCallback(() => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const closePicker = useCallback((restoreFocus = false) => {
    cancelPickerClose();
    setPickerOpenMode(null);
    if (restoreFocus) pickerTriggerRef.current?.focus();
  }, [cancelPickerClose]);

  // Hover-only open. Small close delay so moving the pointer from the icon
  // into the picker doesn't flicker it shut.
  const openPickerOnHover = (event: React.PointerEvent) => {
    if (!hoverToOpenPicker || event.pointerType === "touch" || iconType === "talk") return;
    isPointerOverPicker.current = true;
    cancelPickerClose();
    setPickerOpenMode((current) => current ?? "hover");
  };
  const schedulePickerClose = () => {
    cancelPickerClose();
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      // Check focus when the timer fires as well as cancelling on focus entry.
      if (pickerOptionsRef.current?.contains(document.activeElement)) return;
      setPickerOpenMode((current) => current === "hover" ? null : current);
    }, 120);
  };
  const closePickerOnHoverEnd = (event: React.PointerEvent) => {
    if (event.pointerType === "touch") return;
    isPointerOverPicker.current = false;
    schedulePickerClose();
  };
  useEffect(() => cancelPickerClose, [cancelPickerClose]);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (
        pickerWrapperRef.current &&
        !pickerWrapperRef.current.contains(event.target as Node)
      ) {
        closePicker();
      }
    };
    if (isPickerOpen) {
      document.addEventListener("pointerdown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [isPickerOpen, closePicker]);

  // Close expanded note editor when clicking outside
  useEffect(() => {
    if (!isNoteExpanded) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (noteEditorRef.current && !noteEditorRef.current.contains(target)) {
        setIsNoteExpanded(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isNoteExpanded]);

  // Convert item.icon to string | null to fix type issues
  const iconType = item.icon === undefined ? null : item.icon;

  // Determine if icon is set
  const hasIcon = !!item.icon && item.icon !== "talk";

  // Render icon button for fill mode
  const renderIconButton = () => {
    const selectedOption =
      ICON_OPTIONS.find((opt) => opt.value === iconType) ||
      ICON_OPTIONS[ICON_OPTIONS.length - 1];

    // Don't allow changing icons for "talk" items in fill mode
    if (iconType === "talk") {
      // Render the icon in a button-like container but without arrow and interaction
      return (
        <div
          className={`hc-field inline-flex items-center justify-between px-1.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md ${
            selectedOption.bgColor
          }`}
          style={{ minWidth: "42px" }} /* Match width of buttons with arrows */
          aria-label="Icon"
        >
          {renderIcon(iconType)}
          <div className="w-4"></div>{" "}
          {/* Spacer to compensate for missing arrow */}
        </div>
      );
    }

    // Compact version for fill mode - icon only with dropdown arrow
    return (
      <button
        type="button"
        ref={pickerTriggerRef}
        onClick={() => {
          // A click upgrades a hover preview to an explicitly opened picker.
          // Subsequent clicks toggle it closed, as they do when hover is off.
          cancelPickerClose();
          setPickerOpenMode((current) => current === "explicit" ? null : "explicit");
        }}
        onPointerEnter={openPickerOnHover}
        onPointerLeave={closePickerOnHoverEnd}
        className={`hc-field inline-flex items-center px-1.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 ${
          iconType ? selectedOption.bgColor : "bg-white dark:bg-gray-800"
        }`}
        aria-label="Select icon"
        aria-haspopup="dialog"
        aria-expanded={isPickerOpen}
      >
        {renderIcon(iconType)}
        <IconChevron direction="down" className="h-3.5 w-3.5 ml-0.5" />
      </button>
    );
  };

  // Handle expanding the note editor
  const handleExpandNote = () => {
    closePicker();
    setIsNoteExpanded(true);
  };

  // Render the note editor for fill mode
  const renderNoteEditor = () => {
    if (isNoteExpanded) {
      // Rich text editor when expanded
      return (
        <div
          ref={noteEditorRef}
          className="border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
          onKeyDownCapture={(event) => {
            if (event.key !== "Escape" || event.defaultPrevented || event.nativeEvent.isComposing) return;
            event.preventDefault();
            event.stopPropagation();
            noteEditorRef.current?.closest<HTMLElement>('[data-item-row]')?.focus();
            setIsNoteExpanded(false);
          }}
        >
          <RichTextEditor
            value={item.note || null}
            onChange={(richText) => onNoteChange(catIndex, itemIndex, richText)}
            className="text-sm"
            autoFocus
          />
        </div>
      );
    } else {
      // Format the note text to preserve line breaks
      const formattedNote = !isRichTextEmpty(item.note)
        ? renderRichText(item.note)
        : "Add a note...";

      // Note text that expands when clicked
      return (
        <div
          onClick={handleExpandNote}
          data-note-trigger="true"
          className={`text-gray-800 dark:text-gray-50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 cursor-text text-sm whitespace-pre-line transition-colors duration-200 rounded py-0.5 -my-0.5 ${isRichTextEmpty(item.note) ? "text-gray-500 dark:text-gray-400" : ""}`}
          style={{
            transform: hasIcon ? "translateY(-0.3rem)" : "translateY(-0.7rem)",
            marginBottom: hasIcon ? "-0.3rem" : "-0.7rem",
            marginLeft: "5.15rem",
            paddingLeft: "0.25rem",
            paddingRight: "0.25rem",
            marginRight: "-0.25rem",
          }}
        >
          {formattedNote}
        </div>
      );
    }
  };

  return (
    <>
      <div className="item-name">
        <div
          className="relative flex items-start flex-col w-full"
          ref={pickerWrapperRef}
        >
          {/* Fill mode layout - icon stays before title */}
          <div className="flex flex-row items-center w-full mb-2 gap-2">
            <div className="relative inline-flex shrink-0">
              {renderIconButton()}
            </div>
            <div className="flex-grow flex items-center pl-3">
              <span className={`font-bold ${getItemSpanClasses(item.icon)}`}>
                {item.name}
              </span>
            </div>
          </div>

          {/* Hover handlers repeated here so moving the pointer from the
              button down into the (separately positioned) picker doesn't
              trip the close timer before it arrives. */}
          <div
            ref={pickerOptionsRef}
            onPointerEnter={openPickerOnHover}
            onPointerLeave={closePickerOnHoverEnd}
            onFocusCapture={cancelPickerClose}
            onBlurCapture={() => {
              if (!isPointerOverPicker.current) schedulePickerClose();
            }}
          >
            <IconPicker
              selectedIcon={iconType}
              onSelectIcon={(icon) => {
                onIconChange(catIndex, itemIndex, icon);
                closePicker(true);
              }}
              isOpen={isPickerOpen}
              mode="fill"
              onClose={() => closePicker(pickerWrapperRef.current?.contains(document.activeElement))}
              parentRef={pickerWrapperRef}
              autoFocus={pickerOpenMode === "explicit"}
            />
          </div>
        </div>
      </div>
      <div className="mt-2">{renderNoteEditor()}</div>
    </>
  );
}

