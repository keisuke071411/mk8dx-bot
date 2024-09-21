import { Input } from "@/components/ui/input";
import type { TeamScore } from "@/types";
import { Diff } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";

type FormProps = {
  teamScoreList: TeamScore[];
  setTeamScoreList: Dispatch<SetStateAction<TeamScore[]>>;
};

type FormValues = {
  results: TeamScore[];
};

export const Form = ({ teamScoreList, setTeamScoreList }: FormProps) => {
  const { register, handleSubmit, control, reset } = useForm<FormValues>({
    defaultValues: {
      results: teamScoreList.sort((a, b) => b.score - a.score),
    },
  });

  const { fields, remove } = useFieldArray({
    control,
    name: "results",
  });

  // 外部のteamScoreList更新に対する反映フラグ
  const isUpdatingFromTeamScoreList = useRef(false);

  // teamScoreListが変更された時にフォームをリセットして更新
  useEffect(() => {
    if (!isUpdatingFromTeamScoreList.current) {
      reset({
        results: teamScoreList.sort((a, b) => b.score - a.score),
      });
    }
    isUpdatingFromTeamScoreList.current = false;
  }, [teamScoreList, reset]);

  const onSubmit = (data: FormValues) => {
    console.info("フォーム送信:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pr-20">
      <div className="w-fit ml-auto flex flex-col gap-2">
        {fields.map((item, index) => (
          <div
            key={item.id}
            className="h-16 flex items-center gap-2 text-white relative"
          >
            <Input
              {...register(`results.${index}.team`, {
                onChange: (e) => {
                  // labelが空ならフィールドを削除
                  if (e.target.value === "") {
                    remove(index);
                  }
                },
              })}
              defaultValue={item.team}
              className="w-24 h-full text-2xl rounded-l-lg text-center bg-primary [appearance:textfield] [&::-webkit-outer-spin-button] [&::-webkit-inner-spin-button]"
            />
            <Input
              {...register(`results.${index}.score`, {
                valueAsNumber: true, // 入力を数値として扱う
                // scoreが変更された時にteamScoreListを更新
                onBlur: (e) => {
                  setTeamScoreList((prev) =>
                    prev.map((item) =>
                      item.team === fields[index].team
                        ? { ...item, score: e.target.valueAsNumber }
                        : item,
                    ),
                  );
                },
              })}
              defaultValue={item.score}
              type="number"
              className="w-24 h-full text-2xl rounded-r-lg text-center bg-primary [appearance:textfield] [&::-webkit-outer-spin-button] [&::-webkit-inner-spin-button]"
            />
            {fields.length !== index + 1 && (
              <p className="flex items-center min-w-12 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)] text-2xl text-center font-bold self-end absolute -right-16 -bottom-5">
                <Diff />
                {fields[index].score - fields[index + 1].score}
              </p>
            )}
          </div>
        ))}
      </div>
    </form>
  );
};
