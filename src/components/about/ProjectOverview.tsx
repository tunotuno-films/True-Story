import React from 'react';
import Highlight from "@/components/Highlight";

const ProjectOverview = () => {
  return (
    <section className="pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text">
            True Story【実話の物語】とは？
          </h1>
          <div className="space-y-8 text-lg leading-relaxed text-neutral-200">
            <p>
              テクノロジーの進化によって、誰もが手軽に情報を発信し、“感性と表現の領域”までもが、AIなどに置き換えられてしまう時代になりました。
            </p>
            <p>
              その一方で、SNSフェイクニュースや匿名の言葉があふれ、真実と虚構の境界が曖昧になり、人と人との心の距離が広がっているようにも感じます。
            </p>
            <p>
              True Story【実話の物語】は、そんな時代にこそ「人が生きてきた本当の物語」に光を当てるプロジェクトです。
            </p>
            <p>
                <Highlight>誰かの実体験をもとに、音楽と映像を通して“真実の記録”として残す。</Highlight>AIでは再現できない、人の心にしか生み出せないあたたかさや、痛み、希望を表現していきます。
            </p>
            <p>
              世の中には、まだ知られていないけれど、きっと誰かの背中を押す力を持ったストーリーがたくさんあります。その一つひとつを「実話」として掘り起こし、誰かが詩にし、アーティストやクリエイターが作品として形にしていく。そこに生まれる共感や対話こそが、次の誰かを救うきっかけになると信じています。
            </p>
            <p>
              出所のわからない情報に流されるのではなく、<Highlight>“人が創り、人が伝える”</Highlight>という原点に立ち返る。私たちは、そんな想いを共有してくださるすべての方々とともに、「真実の声が響く社会」を創り続けていきます。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectOverview;