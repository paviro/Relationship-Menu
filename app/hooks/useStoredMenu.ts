'use client';

import { useSyncExternalStore } from 'react';
import { getAllMenus, type MenuInfo } from '../utils/menuStorage';

// Shared external store for menu data held in localStorage. Re-reads when storage
// changes in another tab ('storage') or within this tab ('menuDataChanged').
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('menuDataChanged', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('menuDataChanged', callback);
  };
}

function getServerSnapshot() {
  return false;
}

function getHasStoredMenuSnapshot() {
  return localStorage.getItem('relationship_menu_data') !== null;
}

function getHasSavedMenusSnapshot() {
  try {
    return getAllMenus().length > 0;
  } catch (error) {
    console.error('Error checking for saved menus:', error);
    return false;
  }
}

/** Reactively tracks whether an active menu exists under `relationship_menu_data`. */
export function useHasStoredMenu() {
  return useSyncExternalStore(subscribe, getHasStoredMenuSnapshot, getServerSnapshot);
}

/** Reactively tracks whether any saved menus exist in the menu index. */
export function useHasSavedMenus() {
  return useSyncExternalStore(subscribe, getHasSavedMenusSnapshot, getServerSnapshot);
}

// getAllMenus() returns a fresh array each call, which would loop useSyncExternalStore.
// Cache and only swap the reference when the serialized contents actually change.
const EMPTY_MENUS: MenuInfo[] = [];
let cachedMenus: MenuInfo[] = EMPTY_MENUS;
let cachedMenusKey = '';

function getSavedMenusSnapshot(): MenuInfo[] {
  try {
    const menus = getAllMenus();
    const key = JSON.stringify(menus);
    if (key !== cachedMenusKey) {
      cachedMenusKey = key;
      cachedMenus = menus;
    }
    return cachedMenus;
  } catch (error) {
    console.error('Error loading saved menus:', error);
    return cachedMenus;
  }
}

function getSavedMenusServerSnapshot(): MenuInfo[] {
  return EMPTY_MENUS;
}

/** Reactively returns the list of saved menus from the menu index. */
export function useSavedMenus() {
  return useSyncExternalStore(subscribe, getSavedMenusSnapshot, getSavedMenusServerSnapshot);
}
