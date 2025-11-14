"use client";

import React from "react";

const CompanyInfo = () => {
  return (
    <section className="bg-[#40848E] text-white py-12 w-full">
      <div className="px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">運営会社情報</h2>
        <ul className="space-y-3 text-lg">
          <li>
            <strong>会社名:</strong> 株式会社サンプル
          </li>
          <li>
            <strong>所在地:</strong> 東京都渋谷区1-2-3 サンプルビル
          </li>
          <li>
            <strong>設立:</strong> 2020年4月1日
          </li>
          <li>
            <strong>代表者:</strong> 山田 太郎
          </li>
          <li>
            <strong>事業内容:</strong> ウェブサービスの企画・開発・運営
          </li>
          <li>
            <strong>連絡先:</strong> info@example.com
          </li>
          <li>
            <strong>電話番号:</strong> 03-1234-5678
          </li>
        </ul>
      </div>
    </section>
  );
};

export default CompanyInfo;
