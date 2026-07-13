# 安全的 r1.env 载入器(供各插件脚本 source)。
# 逐行解析 KEY=VALUE,**不执行文件** —— 不做命令替换、不跑任意代码;因此一个被投毒的
# r1.env(如 `PORT=$(rm -rf ~)`)在这里只会被当成普通字符串,不会被求值。
# 已在环境中设置的变量优先(命令行/父进程可覆盖 r1.env)。仅接受合法的 shell 变量名。
#
# 用法:  . "$(dirname "$0")/scripts/load-env.sh"; load_r1_env ./r1.env
load_r1_env() {
  local envfile="${1:-r1.env}"
  [ -f "$envfile" ] || return 0
  local line key val
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in ''|\#*) continue ;; esac      # 空行/注释
    case "$line" in *=*) ;; *) continue ;; esac    # 无 = 号,跳过
    key="${line%%=*}"; val="${line#*=}"
    key="$(printf '%s' "$key" | tr -d '[:space:]')"
    [ -z "$key" ] && continue
    case "$key" in [!A-Za-z_]* | *[!A-Za-z0-9_]*) continue ;; esac  # 非法变量名,跳过
    [ -z "${!key:-}" ] && export "$key=$val"
  done < "$envfile"
}
