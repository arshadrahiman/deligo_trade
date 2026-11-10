import React, { useState } from 'react';
import { Dumbbell, Plus, Minus, Check, Layers, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/numberToWords';

export default function ProductCard({ product, inCartQty = 0, onAdd, onRemove }) {
  const [imageError, setImageError] = useState(false);

  const stock = product.stockQty !== undefined ? product.stockQty : 10;
  const isOutOfStock = stock <= 0;

  return (
    <div className="group rounded-xl bg-[#0F1420] border border-[#1E2839] hover:border-[#FED430]/50 transition-all duration-300 flex flex-col justify-between p-4 shadow-lg hover:shadow-2xl hover:shadow-[#FED430]/5">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#141A26] border border-[#26334D] text-[#FED430]">
            {product.category}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-slate-300 border border-slate-800">
              #{product.code}
            </span>

            {/* Stock pill */}
            <span
              className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                isOutOfStock
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                  : stock < 4
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isOutOfStock ? 'Out of Stock' : `Stock: ${stock}`}
            </span>
          </div>
        </div>

        {/* Product Image Frame */}
        <div className="w-full h-48 bg-white/95 rounded-lg p-3 flex items-center justify-center overflow-hidden relative group-hover:bg-white transition-colors">
          {!imageError ? (
            <img
              src={product.imagePath}
              alt={product.name}
              className="max-h-full max-w-full object-contain group-hover:scale-106 transition-transform duration-300"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <Dumbbell className="w-12 h-12 stroke-1 mb-1" />
              <span className="text-[10px] uppercase font-bold text-slate-500">
                {product.code}
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="mt-3.5 space-y-1.5">
          <h3 className="font-oswald text-base sm:text-lg font-bold text-white tracking-wide leading-snug line-clamp-2">
            {product.name}
          </h3>

          <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="pt-4 mt-3 border-t border-[#1E2839] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
            Warehouse Price (Excl. VAT)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-[#FED430]">AED</span>
            <span className="font-oswald text-lg sm:text-xl font-black text-white tracking-wide">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {inCartQty > 0 ? (
            <div className="flex items-center gap-1.5 bg-[#141A26] border border-[#FED430] rounded-lg p-1">
              <button
                onClick={onRemove}
                className="w-7 h-7 rounded bg-[#1E2839] hover:bg-red-500 hover:text-white text-slate-200 flex items-center justify-center transition-colors"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-black text-xs text-white">
                {inCartQty}
              </span>
              <button
                onClick={onAdd}
                disabled={inCartQty >= stock}
                className="w-7 h-7 rounded bg-[#FED430] text-black hover:bg-[#e5be2b] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold transition-colors"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              disabled={isOutOfStock}
              className={`px-3.5 py-2 rounded-lg font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 ${
                isOutOfStock
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-[#FED430] text-black hover:bg-[#e5be2b] shadow-md shadow-[#FED430]/20'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Quote</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

