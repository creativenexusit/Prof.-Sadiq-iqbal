'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteAcademicItemAdmin } from '@/app/actions/adminCrud';
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Search,
  Layers,
  CheckCircle2,
  AlertCircle,
  Filter,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AcademicItemData = Record<string, any>;

function ItemThumbnail({ url, title }: { url?: string; title?: string }) {
  const [error, setError] = useState(false);

  if (!url || error) {
    return (
      <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl shrink-0 border border-[#282830] bg-[#18181F] flex items-center justify-center text-neutral-500 mt-0.5 sm:mt-0">
        <Layers size={16} />
      </div>
    );
  }

  return (
    <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-xl overflow-hidden shrink-0 border border-[#282830] bg-[#0E0E10] mt-0.5 sm:mt-0">
      <Image
        src={url}
        alt={title || 'Thumbnail'}
        fill
        unoptimized
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

interface ItemsManagerProps {
  initialItems: AcademicItemData[];
  initialCategory?: string;
}

export default function ItemsManager({
  initialItems,
  initialCategory = 'all',
}: ItemsManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState<AcademicItemData[]>(initialItems);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const categories: { label: string; value: string; short: string }[] = [
    { label: 'All Items', value: 'all', short: 'All' },
    { label: 'Gallery Photos', value: 'gallery', short: 'Gallery' },
    { label: 'Projects', value: 'project', short: 'Projects' },
    { label: 'Patents', value: 'patent', short: 'Patents' },
    { label: 'Lab Members', value: 'lab_member', short: 'Members' },
    { label: 'Teaching', value: 'teaching', short: 'Courses' },
    { label: 'Talks & Keynotes', value: 'talk', short: 'Talks' },
    { label: 'News & Media', value: 'news', short: 'News' },
  ];

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    items.forEach((item) => {
      const cat = item.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!query) return true;
      return (
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.dateOrPeriod?.toLowerCase().includes(query)
      );
    });
  }, [items, activeCategory, searchQuery]);

  async function handleDelete(id?: string, slug?: string) {
    if (!confirm('Are you sure you want to permanently delete this item?')) return;
    setDeletingId(id || slug || 'del');

    try {
      if (id) {
        await deleteAcademicItemAdmin(id);
      }
      setItems((prev) =>
        prev.filter((it) => ('_id' in it ? String(it._id) !== id : it.slug !== slug))
      );
      setStatusMessage({ type: 'success', text: 'Item deleted successfully.' });
      router.refresh();
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to delete item.' });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-xl text-xs transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/40 border border-red-500/40 text-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={15} className="text-red-400 shrink-0" />
          )}
          <span className="truncate">{statusMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#1F1F24]">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Research &amp; Portfolio
          </h1>
          <p className="text-[11px] text-neutral-400">
            {filteredItems.length} of {items.length} items
          </p>
        </div>

        <Link
          href={
            activeCategory !== 'all'
              ? `/admin/items/new?category=${activeCategory}`
              : '/admin/items/new'
          }
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-black text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md cursor-pointer shrink-0 min-h-[34px] sm:min-h-[38px] hover:brightness-110"
          style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
        >
          <Plus size={13} strokeWidth={3} />
          <span className="hidden sm:inline">Add Item</span>
          <span className="sm:hidden inline">Add</span>
        </Link>
      </div>

      {/* Search & Category Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by title, category, date..."
            className="w-full pl-8 pr-7 py-2 rounded-xl bg-[#141418] border border-[#222226] text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)] transition min-h-[38px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category Filter Dropdown */}
        <div className="relative sm:w-60 shrink-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
            <Filter size={13} />
          </div>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="w-full appearance-none pl-8 pr-8 py-2 rounded-xl bg-[#141418] border border-[#222226] text-white text-xs font-semibold focus:outline-none focus:border-[var(--theme-color,#FFA800)] transition min-h-[38px] cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-[#141418] text-white">
                {cat.short} ({categoryCounts[cat.value] || 0})
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
            <ChevronDown size={13} />
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="rounded-xl sm:rounded-2xl border border-[#222226] bg-[#141418] overflow-hidden shadow-sm">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs text-neutral-400">
              No items found {activeCategory !== 'all' ? `in ${activeCategory}` : ''}.
            </p>
            <Link
              href={
                activeCategory !== 'all'
                  ? `/admin/items/new?category=${activeCategory}`
                  : '/admin/items/new'
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--theme-color,#FFA800)] bg-[var(--theme-color,#FFA800)]/10 hover:bg-[var(--theme-color,#FFA800)]/20 transition cursor-pointer"
            >
              <Plus size={12} />
              <span>Create first item</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#1F1F24]">
            {filteredItems.map((item, idx) => (
              <div
                key={item._id ? String(item._id) : idx}
                className="p-3 sm:p-4 flex items-start sm:items-center justify-between gap-2.5 sm:gap-4 hover:bg-[#16161B] transition-colors"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                  <ItemThumbnail url={item.image?.url} title={item.title} />

                  <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--theme-color,#FFA800)]/15 text-[var(--theme-color,#FFA800)] border border-[var(--theme-color,#FFA800)]/30 shrink-0">
                        {item.category}
                      </span>
                      {item.dateOrPeriod && (
                        <span className="text-[10px] sm:text-xs text-neutral-400 font-mono truncate">
                          {item.dateOrPeriod}
                        </span>
                      )}
                      {item.isFeatured && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          Featured
                        </span>
                      )}
                      {typeof item.order === 'number' && item.order > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1C1C24] text-neutral-400 border border-[#282834] shrink-0">
                          Order: {item.order}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-xl">
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-[11px] text-neutral-400 line-clamp-1 max-w-xl">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/admin/items/${item._id ? String(item._id) : item.slug}`}
                    className="p-1 sm:p-1.5 rounded-lg border border-[#282830] bg-[#1A1A20] text-neutral-300 hover:text-white hover:border-[var(--theme-color,#FFA800)] text-xs flex items-center gap-1 min-h-[30px] px-2 cursor-pointer transition"
                    title="Edit item"
                  >
                    <Edit3 size={11} />
                    <span className="text-[11px]">Edit</span>
                  </Link>
                  <button
                    onClick={() =>
                      handleDelete(
                        '_id' in item ? String(item._id) : undefined,
                        item.slug
                      )
                    }
                    disabled={
                      deletingId ===
                      ('_id' in item ? String(item._id) : item.slug)
                    }
                    className="p-1 sm:p-1.5 rounded-lg border border-[#282830] bg-[#1A1A20] text-neutral-400 hover:text-red-400 hover:border-red-900 transition min-h-[30px] px-1.5 sm:px-2 cursor-pointer disabled:opacity-50"
                    title="Delete item"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
