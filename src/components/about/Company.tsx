"use client";

import React from "react";

const CompanyInfo = () => {
  return (

    <section className="bg-[#40848E] text-white py-14 w-full">
      <div className="px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-12 text-center">
          運営会社情報
        </h2>

        {/* --- 1社目 --- */}
        <ul className="space-y-4 text-base leading-7 mb-12">
         <h3 className="text-2xl font-bold mb-4">ルミノスタジオ株式会社</h3>
          <li className="flex">
            <span className="font-semibold w-12">所在地</span>
            <span className="w-5 text-left">：</span>
            <span>
              〒354-0035<br />
              埼玉県富士見市ふじみ野西１丁目18−１ 斉藤ビル 3F
            </span>
          </li>
          <li className="flex">
            <span className="font-semibold w-12">Mail</span>
            <span className="w-5 text-left">：</span>
            <span>info@luminostudio.net</span>
          </li>
          <li className="flex">
            <span className="font-semibold w-12">Tel</span>
            <span className="ont-semibold w-5 text-left">：</span>
            <span>090-1808-6458</span>
          </li>
          <li className="flex">
            <span className="font-semibold w-12">Web</span>
            <span className="ont-semibold w-5 text-left">：</span>
            <a
              href="https://luminostudio.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              https://luminostudio.net/
            </a>
          </li>

        </ul>

        {/* --- 2社目 --- */}
        <ul className="space-y-4 text-base leading-7">
          <h3 className="text-2xl font-bold mb-4">PEGASUS株式会社</h3>
          
          <li className="flex">
            <span className="font-semibold w-12">所在地</span>
            <span className="w-5 text-left">：</span>
            <span>
              〒160-0023<br />
              東京都新宿区西新宿３丁目３番１３号 西新宿水間ビル２Ｆ
            </span>
          </li>
          <li className="flex">
            <span className="font-semibold w-12">Web</span>
            <span className="w-5 text-left">：</span>
            <a
              href="https://shoma-piano.themedia.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              https://shoma-piano.themedia.jp/
            </a>
          </li>


        </ul>
      </div>
    </section>




  );
};

export default CompanyInfo;
