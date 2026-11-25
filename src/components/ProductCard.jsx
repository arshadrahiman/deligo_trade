import React, { useState } from 'react';
import { Dumbbell, Plus, Minus, Check, Layers, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/numberToWords';

export default function ProductCard({ product, inCartQty = 0, onAdd, onRemove }) {
  const [imageError, setImageError] = useState(false);

  const stock = product.stockQty !== undefined ? product.stockQty : 10;
  const isOutOfStock = stock <= 0;

  return (
    <div className="group pos-glass-card rounded-2xl flex flex-col justify-between p-4 shadow-xl hover:shadow-2xl transition-all duration-300 relative">
      <div>
        {/* Top Identification & Inventory Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300">
            {product.category}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/20">
              #{product.code}
            </span>

            {/* Inventory Status Indicator */}
            <span
              className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                isOutOfStock
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : stock < 4
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOutOfStock ? 'bg-red-400' : stock < 4 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span>{isOutOfStock ? 'Backorder' : `${stock} Units`}</span>
            </span>
          </div>
        </div>

        {/* Product Image Stage */}
        <div className="w-full h-48 bg-gradient-to-b from-white to-slate-100 rounded-xl p-3 flex items-center justify-center overflow-hidden relative border border-slate-200/80 group-hover:border-amber-400/40 transition-colors shadow-inner">
          {!imageError ? (
            <img
              src={product.imagePath}
              alt={product.name}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <Dumbbell className="w-10 h-10 stroke-1 mb-1 text-slate-400" />
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                {product.code}
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="mt-3.5 space-y-1">
          <h3 className="font-sans text-sm sm:text-base font-bold text-white tracking-tight leading-snug line-clamp-2">
            {product.name}
          </h3>

          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* POS Pricing & Register Stepper */}
      <div className="pt-3.5 mt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
        <div>
          <span className="text-[9.5px] uppercase font-mono text-slate-400 block tracking-wider leading-none">
            COMMERCIAL RATE
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-mono font-bold text-amber-400">AED</span>
            <span className="font-mono text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>

        {/* POS Action Stepper */}
        <div>
          {inCartQty > 0 ? (
            <div className="flex items-center gap-1 bg-[#0A0E18] border border-amber-400/40 rounded-xl p-1 shadow-sm">
              <button
                onClick={onRemove}
                className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-red-500 hover:text-white text-slate-300 flex items-center justify-center transition-colors active:scale-95"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-mono font-black text-xs text-amber-400">
                {inCartQty}
              </span>
              <button
                onClick={onAdd}
                disabled={inCartQty >= stock}
                className="w-7 h-7 rounded-lg bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold transition-all active:scale-95"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              disabled={isOutOfStock}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs font-mono tracking-wider flex items-center gap-1.5 transition-all active:scale-95 ${
                isOutOfStock
                  ? 'bg-white/[0.04] text-slate-500 border border-white/[0.06] cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-md shadow-amber-500/20'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Bill</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
