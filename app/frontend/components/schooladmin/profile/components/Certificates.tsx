import { Award, Download } from "lucide-react";

type Certificate = {
  id: string;
  title: string;
  issuedDate: string;
  issuedBy: string | null;
  certificateUrl: string | null;
};

type Props = {
  certificates?: Certificate[];
};

export const Certificates = ({ certificates = [] }: Props) => (
  <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 rounded-2xl p-4 sm:p-6">
    <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-4 sm:mb-6">
      <span className="text-lime-400">
        <Award size={20} />
      </span>
      Certificates
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {certificates.length > 0 ? (
        certificates.map((c) => (
          <div
            key={c.id}
            className="bg-white/5 backdrop-blur-xl border-b border-white/10 rounded-2xl p-4 flex justify-between items-center border border-white/5"
          >
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 bg-lime-400/10 rounded-xl flex items-center justify-center text-lime-400">
                <Award size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">{c.title}</p>
                <p className="text-[10px] text-gray-500">
                  Issued on {new Date(c.issuedDate).toISOString().slice(0, 10)}
                </p>
              </div>
            </div>
            <a
              href={c.certificateUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white p-3 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation rounded-lg"
              aria-label="Download"
            >
              <Download size={18} />
            </a>
          </div>
        ))
      ) : (
        <div className="col-span-2 py-6 text-center text-gray-500 text-sm">
          No certificates yet
        </div>
      )}
    </div>
  </div>
);
